import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteController } from 'src/train_routes/route.controller';
import { RouteService } from 'src/train_routes/route.service';
import { Route } from 'src/entities/route.entity';
import { RouteStop } from 'src/entities/route_stop.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Route, RouteStop]),
  ],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
