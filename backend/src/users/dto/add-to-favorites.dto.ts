import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToFavoritesDto {
  @ApiProperty({
    description: 'Route unique identifier to add/remove from favorites',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  route_id: string;
}
