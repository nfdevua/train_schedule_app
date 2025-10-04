import { ApiProperty } from '@nestjs/swagger';
import {
  IRouteResponse,
  IRouteStopResponse,
} from '../interfaces/route-response.interface';

export class RouteStopResponseDto implements IRouteStopResponse {
  @ApiProperty({
    description: 'Stop unique identifier',
    example: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Station name',
    example: 'Hartford',
  })
  station: string;

  @ApiProperty({
    description: 'Arrival time at the station',
    example: '2024-01-15T11:30:00Z',
    nullable: true,
  })
  time_arrival: string | null;

  @ApiProperty({
    description: 'Order of the stop in the route',
    example: 1,
  })
  order_index: number;

  @ApiProperty({
    description: 'Route ID this stop belongs to',
    example: 'uuid',
  })
  route_id: string;

  @ApiProperty({
    description: 'Stop creation timestamp',
    example: '2024-01-15T10:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Stop last update timestamp',
    example: '2024-01-15T10:00:00Z',
  })
  updated_at: string;
}

export class RouteResponseDto implements IRouteResponse {
  @ApiProperty({
    description: 'Route unique identifier',
    example: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Train number',
    example: 'IC101',
  })
  train_number: string;

  @ApiProperty({
    description: 'Type of train',
    example: 'intercity',
  })
  train_type: string;

  @ApiProperty({
    description: 'Departure station name',
    example: 'New York',
  })
  departure_station: string;

  @ApiProperty({
    description: 'Arrival station name',
    example: 'Boston',
  })
  arrival_station: string;

  @ApiProperty({
    description: 'Departure time',
    example: '2024-01-15T10:00:00Z',
  })
  departure_time: string;

  @ApiProperty({
    description: 'Arrival time',
    example: '2024-01-15T14:30:00Z',
  })
  arrival_time: string;

  @ApiProperty({
    description: 'Journey duration',
    example: '4h 30m',
  })
  duration: string;

  @ApiProperty({
    description: 'Ticket price',
    example: 89.5,
  })
  price: number;

  @ApiProperty({
    description: 'Number of available seats',
    example: 200,
  })
  total_available_seats: number;

  @ApiProperty({
    description: 'Route stops',
    type: [RouteStopResponseDto],
    required: false,
  })
  stops?: RouteStopResponseDto[];

  @ApiProperty({
    description: 'Route creation timestamp',
    example: '2024-01-15T10:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Route last update timestamp',
    example: '2024-01-15T10:00:00Z',
  })
  updated_at: string;
}
