import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Favorite } from 'src/entities/favorite.entity';
import {
  FavoriteResponseDto,
  FavoritesListResponseDto,
} from './dto/user-response.dto';
import { MESSAGES } from 'src/shared/constants/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async toggleFavorites(user_id: string, route_id: string): Promise<boolean> {
    const existingFavorite = await this.favoritesRepository
      .delete({
        user_id,
        route_id,
      })
      .catch();

    if (existingFavorite.affected === 1) {
      return false;
    }

    const favorite = this.favoritesRepository.create({
      user_id,
      route_id,
    });

    await this.favoritesRepository.save(favorite);

    return true;
  }

  async getUserFavorites(user_id: string): Promise<FavoritesListResponseDto> {
    const favorites = await this.favoritesRepository
      .createQueryBuilder('favorites')
      .leftJoinAndSelect('favorites.route', 'routes')
      .where('favorites.user_id = :user_id', { user_id })
      .orderBy('favorites.created_at', 'DESC')
      .getMany();

    if (!favorites) {
      throw new NotFoundException(MESSAGES.noFavoritesFound);
    }

    const favoritesResponse: FavoriteResponseDto[] = favorites.map(
      (favorite) => ({
        id: favorite.id,
        user_id: favorite.user_id,
        route_id: favorite.route_id,
        created_at: favorite.created_at,
        updated_at: favorite.updated_at,
        route: favorite.route,
      }),
    );

    return {
      favorites: favoritesResponse,
      total: favorites.length,
    };
  }
}
