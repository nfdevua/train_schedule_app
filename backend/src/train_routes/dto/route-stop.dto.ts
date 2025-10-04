import { IsString, IsOptional, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RouteStopDto {
  @ApiProperty({
    description: 'Station name',
    example: 'Central Station',
    required: true,
  })
  @IsString()
  station: string;

  @ApiProperty({
    description: 'Arrival time at station (optional)',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: string }) => (value ? new Date(value) : null))
  time_arrival: Date | null;

  @ApiProperty({
    description: 'Order index of the stop',
    example: 1,
    required: true,
  })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  order_index: number;
}
