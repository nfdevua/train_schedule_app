import { ApiProperty } from '@nestjs/swagger';
import { Route } from '../../entities/route.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
    enum: ['user', 'admin'],
  })
  role: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  updated_at: Date;
}

export class FavoriteResponseDto {
  @ApiProperty({
    description: 'Favorite unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'Route unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  route_id: string;

  @ApiProperty({
    description: 'Favorite creation timestamp',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Favorite last update timestamp',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Route details',
    type: Route,
  })
  route: Route;
}

export class FavoritesListResponseDto {
  @ApiProperty({
    description: 'List of favorite routes',
    type: [FavoriteResponseDto],
  })
  favorites: FavoriteResponseDto[];

  @ApiProperty({
    description: 'Total number of favorites',
    example: 5,
  })
  total: number;
}
