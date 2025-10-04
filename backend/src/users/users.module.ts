import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Favorite } from '../entities/favorite.entity';
import { Route } from '../entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Favorite, Route])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
