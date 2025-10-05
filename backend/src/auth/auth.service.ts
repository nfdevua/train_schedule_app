import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { MESSAGES, userRoles } from 'src/shared/constants/constants';
import { RedisService } from 'src/redis/redis.service';

const SALT_ROUNDS = 10;

interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  private generateToken(userId: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      role,
    });
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ role: string; access_token: string }> {
    const { username, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException(MESSAGES.usernameAlreadyExists);
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const userData = {
      username,
      password_hash,
      role: userRoles.user, // default role - user
    };

    const user = this.userRepository.create(userData);

    const { id, role } = await this.userRepository.save(user);
    const access_token = this.generateToken(id, role);

    await this.redisService.setUserSession(id, {
      id,
      role,
      loginTime: new Date(),
    });

    return { role, access_token };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ role: string; access_token: string }> {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(MESSAGES.invalidCredentials);
    }

    const { id, role, password_hash } = user;

    const isPasswordValid = await bcrypt.compare(password, password_hash);
    if (!isPasswordValid) {
      throw new BadRequestException(MESSAGES.invalidCredentials);
    }

    const access_token = this.generateToken(id, role);

    await this.redisService.setUserSession(id, {
      id,
      role,
      loginTime: new Date(),
    });

    return { role, access_token };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      return this.jwtService.verify(token, {
        secret: jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.redisService.deleteUserSession(userId);
  }

  async getUserSession(userId: string): Promise<any> {
    return await this.redisService.getUserSession(userId);
  }
}
