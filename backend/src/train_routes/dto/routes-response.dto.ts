import { ApiProperty } from '@nestjs/swagger';
import { IRoutesResponse } from '../interfaces/routes-response.interface';
import { RouteResponseDto } from './route-response.dto';

export class RoutesResponseDto implements IRoutesResponse {
  @ApiProperty({
    description: 'Array of routes',
    type: [RouteResponseDto],
  })
  routes: RouteResponseDto[];

  @ApiProperty({
    description: 'Total number of routes matching the criteria',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}
