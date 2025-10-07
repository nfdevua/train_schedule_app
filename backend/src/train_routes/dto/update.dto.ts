import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IRoute } from 'src/shared/interfaces/route.interface';
import { TrainType } from 'src/shared/types/trainType';
import { RouteStopDto } from './route-stop.dto';

export class UpdateDto implements IRoute {
  @ApiProperty({
    description: 'Train route unique identifier',
    example: 'uuid',
    format: 'uuid',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Train number identifier',
    example: 'IC101',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  train_number: string;

  @ApiProperty({
    description: 'Type of train service',
    example: TrainType.INTERCITY,
    enum: TrainType,
  })
  @IsEnum(TrainType)
  train_type: TrainType;

  @ApiProperty({
    description: 'Departure station name',
    example: 'New York',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  departure_station: string;

  @ApiProperty({
    description: 'Arrival station name',
    example: 'Boston',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  arrival_station: string;

  @ApiProperty({
    description: 'Departure date and time',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Transform(({ value }: { value: string }) => new Date(value))
  @IsDate()
  departure_time: Date;

  @ApiProperty({
    description: 'Arrival date and time',
    example: '2024-01-15T12:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Transform(({ value }: { value: string }) => new Date(value))
  @IsDate()
  arrival_time: Date;

  @ApiProperty({
    description: 'Journey duration (calculated automatically)',
    example: '4h 30m',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  duration: string;

  @ApiProperty({
    description: 'Ticket price in USD',
    example: 89.5,
    minimum: 0,
  })
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Total number of available seats',
    example: 200,
    minimum: 0,
  })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  total_available_seats: number;

  @ApiProperty({
    description: 'Route stops (optional)',
    type: [RouteStopDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops?: RouteStopDto[];
}
