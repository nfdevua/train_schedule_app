import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike } from 'typeorm';
import { Route } from 'src/entities/route.entity';
import { RouteStop } from 'src/entities/route_stop.entity';
import { CreateDto } from 'src/train_routes/dto/create.dto';
import { GetDto } from 'src/train_routes/dto/get.dto';
import { UpdateDto } from 'src/train_routes/dto/update.dto';
import { DeleteDto } from 'src/train_routes/dto/delete.dto';
import { IRouteResponse } from 'src/train_routes/interfaces/route-response.interface';
import { IRoutesResponse } from 'src/train_routes/interfaces/routes-response.interface';
import { IMessageResponse } from 'src/train_routes/interfaces/message-response.interface';
import { validateStopsTimes } from 'src/train_routes/helpers/stops-validation.helper';
import { MESSAGES } from 'src/shared/constants/constants';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(RouteStop)
    private routeStopRepository: Repository<RouteStop>,
    private redisService: RedisService,
  ) {}

  private transformRouteToResponse(route: Route): IRouteResponse {
    return {
      ...route,
      departure_time: route.departure_time.toISOString(),
      arrival_time: route.arrival_time.toISOString(),
      created_at: route.created_at.toISOString(),
      updated_at: route.updated_at.toISOString(),
      stops: route.stops?.map((stop) => ({
        ...stop,
        time_arrival: stop.time_arrival?.toISOString() || null,
        created_at: stop.created_at.toISOString(),
        updated_at: stop.updated_at.toISOString(),
      })),
    };
  }

  async create(createDto: CreateDto): Promise<IRouteResponse> {
    const { stops, ...routeData } = createDto;

    if (stops && stops.length > 0) {
      validateStopsTimes(
        stops,
        routeData.departure_time,
        routeData.arrival_time,
      );
    }

    const route = await this.routeRepository.save(routeData);

    if (stops && stops.length > 0) {
      const routeStops = stops.map((stop, index) => ({
        ...stop,
        route_id: route.id,
        order_index: index + 1,
      }));
      await this.routeStopRepository.save(routeStops);
    }

    await this.redisService.clear();

    return this.getOne(route.id);
  }

  async getMany(getDto: GetDto): Promise<IRoutesResponse> {
    const {
      limit,
      offset,
      search,
      departure_date,
      arrival_date,
      ...otherFields
    } = getDto;

    const hasFilters =
      search ||
      departure_date ||
      arrival_date ||
      Object.keys(otherFields).length > 0;

    if (!hasFilters) {
      const cacheKey = `routes:standard:${limit}:${offset}`;
      const cachedData = (await this.redisService.get(
        cacheKey,
      )) as IRoutesResponse | null;

      if (cachedData) {
        return cachedData;
      }
    }

    let whereConditions: Record<string, unknown> | Record<string, unknown>[] = {
      ...otherFields,
    };

    if (search) {
      whereConditions = [
        {
          ...otherFields,
          train_number: ILike(`%${search}%`),
        },
        {
          ...otherFields,
          departure_station: ILike(`%${search}%`),
        },
        {
          ...otherFields,
          arrival_station: ILike(`%${search}%`),
        },
        {
          ...otherFields,
          stops: {
            station: ILike(`%${search}%`),
          },
        },
      ];
    }

    if (departure_date) {
      const startOfDay = new Date(departure_date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(departure_date);
      endOfDay.setHours(23, 59, 59, 999);

      if (Array.isArray(whereConditions)) {
        whereConditions = whereConditions.map(
          (condition: Record<string, unknown>) => ({
            ...condition,
            departure_time: Between(startOfDay, endOfDay),
          }),
        );
      } else {
        whereConditions.departure_time = Between(startOfDay, endOfDay);
      }
    }

    if (arrival_date) {
      const startOfDay = new Date(arrival_date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(arrival_date);
      endOfDay.setHours(23, 59, 59, 999);

      if (Array.isArray(whereConditions)) {
        whereConditions = whereConditions.map(
          (condition: Record<string, unknown>) => ({
            ...condition,
            arrival_time: Between(startOfDay, endOfDay),
          }),
        );
      } else if (whereConditions && typeof whereConditions === 'object') {
        whereConditions.arrival_time = Between(startOfDay, endOfDay);
      }
    }

    const routesPromise = this.routeRepository
      .find({
        where: whereConditions,
        relations: ['stops'],
        skip: offset,
        take: limit,
        order: {
          departure_time: 'DESC',
        },
      })
      .catch(() => {
        throw new NotFoundException(MESSAGES.routeNotFound);
      });

    const totalCountRoutesPromise = this.routeRepository.count({
      where: whereConditions,
    });

    const [routes, total] = await Promise.all([
      routesPromise,
      totalCountRoutesPromise,
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: IRoutesResponse = {
      routes: routes.map((route) => this.transformRouteToResponse(route)),
      total,
      totalPages,
    };

    if (!hasFilters) {
      const cacheKey = `routes:standard:${limit}:${offset}`;
      await this.redisService.set(cacheKey, response, 60 * 60 * 1000);
    }

    return response;
  }

  async getOne(id: string): Promise<IRouteResponse> {
    const cacheKey = `route:${id}`;
    const cachedRoute = (await this.redisService.get(
      cacheKey,
    )) as IRouteResponse | null;

    if (cachedRoute) {
      return cachedRoute;
    }

    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['stops'],
      order: {
        stops: {
          order_index: 'ASC',
        },
      },
    });

    if (!route) {
      throw new NotFoundException(MESSAGES.routeNotFound);
    }

    const transformedRoute = this.transformRouteToResponse(route);

    await this.redisService.set(cacheKey, transformedRoute, 60 * 60 * 1000);

    return transformedRoute;
  }

  async updateOne(updateDto: UpdateDto): Promise<IRouteResponse> {
    const { id, stops, ...updateData } = updateDto;

    if (stops && stops.length > 0) {
      validateStopsTimes(
        stops,
        updateData.departure_time,
        updateData.arrival_time,
      );
    }

    await this.routeRepository.update(id, updateData);

    if (stops !== undefined) {
      await this.routeStopRepository.delete({ route_id: id });

      if (stops.length > 0) {
        const routeStops = stops.map((stop, index) => ({
          ...stop,
          route_id: id,
          order_index: index + 1,
        }));

        await this.routeStopRepository.save(routeStops);
      }
    }

    await this.redisService.clear();

    return await this.getOne(id);
  }

  async deleteOne(deleteDto: DeleteDto): Promise<IMessageResponse> {
    await this.routeRepository.delete(deleteDto.id);

    await this.redisService.clear();

    return { message: 'Train route deleted successfully' };
  }
}
