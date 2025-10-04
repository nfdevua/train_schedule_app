import {
  Delete,
  Controller,
  Post,
  Param,
  Query,
  Patch,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RouteService } from './route.service';
import { CreateDto } from './dto/create.dto';
import { GetDto } from 'src/train_routes/dto/get.dto';
import { UpdateDto } from 'src/train_routes/dto/update.dto';
import { DeleteDto } from 'src/train_routes/dto/delete.dto';
import { RoutesResponseDto } from './dto/routes-response.dto';
import { IRouteResponse } from './interfaces/route-response.interface';
import { IRoutesResponse } from './interfaces/routes-response.interface';
import { IMessageResponse } from './interfaces/message-response.interface';
import { TrainType } from 'src/shared/types/trainType';

@ApiTags('Train Routes')
@ApiBearerAuth('JWT-auth')
@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get('list')
  @ApiOperation({
    summary: 'Get all train routes',
    description:
      'Retrieve a list of train routes with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'train_type',
    required: false,
    description: 'Filter by train type',
    enum: TrainType,
  })
  @ApiQuery({
    name: 'departure_station',
    required: false,
    description: 'Filter by departure station',
  })
  @ApiQuery({
    name: 'arrival_station',
    required: false,
    description: 'Filter by arrival station',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'Number of routes per page',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: true,
    description: 'Number of routes to skip',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved train routes',
    type: RoutesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async getMany(@Query() getDto: GetDto): Promise<IRoutesResponse> {
    return await this.routeService.getMany(getDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get train route by ID',
    description: 'Retrieve a specific train route by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Train route unique identifier',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved train route',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        train_number: { type: 'string', example: 'IC101' },
        train_type: { type: 'string', example: 'intercity' },
        departure_station: { type: 'string', example: 'New York' },
        arrival_station: { type: 'string', example: 'Boston' },
        departure_time: { type: 'string', format: 'date-time' },
        arrival_time: { type: 'string', format: 'date-time' },
        duration: { type: 'string', example: '4h 30m' },
        price: { type: 'number', example: 89.5 },
        total_available_seats: { type: 'number', example: 200 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Train route not found',
  })
  async getOne(@Param('id') id: string): Promise<IRouteResponse> {
    return this.routeService.getOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new train route',
    description: 'Create a new train route with all required information',
  })
  @ApiBody({
    type: CreateDto,
    description: 'Train route creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Train route successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        train_number: { type: 'string', example: 'IC101' },
        train_type: { type: 'string', example: 'intercity' },
        departure_station: { type: 'string', example: 'New York' },
        arrival_station: { type: 'string', example: 'Boston' },
        departure_time: { type: 'string', format: 'date-time' },
        arrival_time: { type: 'string', format: 'date-time' },
        price: { type: 'number', example: 89.5 },
        total_available_seats: { type: 'number', example: 200 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateDto): Promise<IRouteResponse> {
    return this.routeService.create(createDto);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update train route',
    description: 'Update an existing train route with new information',
  })
  @ApiBody({
    type: UpdateDto,
    description: 'Train route update data including ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Train route successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        train_number: { type: 'string', example: 'IC101' },
        train_type: { type: 'string', example: 'intercity' },
        departure_station: { type: 'string', example: 'New York' },
        arrival_station: { type: 'string', example: 'Boston' },
        departure_time: { type: 'string', format: 'date-time' },
        arrival_time: { type: 'string', format: 'date-time' },
        duration: { type: 'string', example: '4h 30m' },
        price: { type: 'number', example: 89.5 },
        total_available_seats: { type: 'number', example: 200 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Train route not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async update(@Body() updateDto: UpdateDto): Promise<IRouteResponse> {
    return this.routeService.updateOne(updateDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete train route',
    description: 'Delete an existing train route by ID',
  })
  @ApiBody({
    type: DeleteDto,
    description: 'Train route deletion data',
  })
  @ApiResponse({
    status: 200,
    description: 'Train route successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Train route deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Train route not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Body() deleteDto: DeleteDto): Promise<IMessageResponse> {
    return this.routeService.deleteOne(deleteDto);
  }
}
