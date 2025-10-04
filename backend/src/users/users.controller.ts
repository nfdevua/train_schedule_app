import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AddToFavoritesDto } from './dto/add-to-favorites.dto';
import { FavoritesListResponseDto } from './dto/user-response.dto';
import { RequestWithDecodedData } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('favorites')
  @ApiOperation({
    summary: 'Toggle favorite route',
    description: 'Add or remove a route from user favorites',
  })
  @ApiBody({
    type: AddToFavoritesDto,
    description: 'Route ID to toggle in favorites',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully toggled favorite status',
    schema: {
      type: 'boolean',
      example: true,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
  })
  async ToggleFavorites(
    @Request() req: RequestWithDecodedData,
    @Body() { route_id }: AddToFavoritesDto,
  ): Promise<boolean> {
    const userId = req.user.id;

    return this.usersService.toggleFavorites(userId, route_id);
  }

  @Get('favorites')
  @ApiOperation({
    summary: 'Get user favorites',
    description: 'Retrieve all favorite routes for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user favorites',
    type: FavoritesListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUserFavorites(
    @Request() req: RequestWithDecodedData,
  ): Promise<FavoritesListResponseDto> {
    const userId = req.user.id;

    return this.usersService.getUserFavorites(userId);
  }
}
