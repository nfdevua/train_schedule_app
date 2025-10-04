import { TrainType } from 'src/shared/types/trainType';

export interface IRoute {
  train_number: string;
  train_type: TrainType;
  departure_station: string;
  arrival_station: string;
  departure_time: Date;
  arrival_time: Date;
  duration: string;
  price: number;
  total_available_seats: number;
}
