import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TrainType } from 'src/shared/types/trainType';
import { IRoute } from 'src/shared/interfaces/route.interface';
import { RouteStop } from './route_stop.entity';

@Entity('routes')
export class Route implements IRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  train_number: string;

  @Column({ type: 'varchar', length: 50 })
  train_type: TrainType;

  @Column({ type: 'varchar', length: 100 })
  departure_station: string;

  @Column({ type: 'varchar', length: 100 })
  arrival_station: string;

  @Column({ type: 'timestamp' })
  departure_time: Date;

  @Column({ type: 'timestamp' })
  arrival_time: Date;

  @Column({ type: 'varchar', length: 50 })
  duration: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer' })
  total_available_seats: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RouteStop, (stop) => stop.route, { cascade: true })
  stops: RouteStop[];
}
