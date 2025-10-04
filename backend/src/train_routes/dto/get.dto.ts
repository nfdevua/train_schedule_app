import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TrainType } from 'src/shared/types/trainType';

export class GetDto {
  @ApiProperty({
    description: 'Filter by train type',
    example: TrainType.INTERCITY,
    enum: TrainType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TrainType)
  train_type: TrainType;

  @ApiProperty({
    description: 'Filter by departure station',
    example: 'New York',
    required: false,
  })
  @IsOptional()
  @IsString()
  departure_station: string;

  @ApiProperty({
    description: 'Filter by arrival station',
    example: 'Boston',
    required: false,
  })
  @IsOptional()
  @IsString()
  arrival_station: string;

  @ApiProperty({
    description: 'Filter by departure date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  departure_date: string;

  @ApiProperty({
    description: 'Filter by arrival date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  arrival_date: string;

  @ApiProperty({
    description:
      'Search in train number, departure station, or arrival station',
    example: 'Express 123',
    required: false,
  })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({
    description: 'Number of routes per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  limit: number;

  @ApiProperty({
    description: 'Number of routes to skip',
    example: 0,
    minimum: 0,
  })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  offset: number;
}
