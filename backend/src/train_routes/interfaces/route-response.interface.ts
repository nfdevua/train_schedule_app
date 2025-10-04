export interface IRouteResponse {
  id: string;
  train_number: string;
  train_type: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  total_available_seats: number;
  stops?: IRouteStopResponse[];
  created_at: string;
  updated_at: string;
}

export interface IRouteStopResponse {
  id: string;
  station: string;
  time_arrival: string | null;
  order_index: number;
  route_id: string;
  created_at: string;
  updated_at: string;
}
