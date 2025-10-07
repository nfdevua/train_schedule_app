export interface RouteStop {
  id?: string;
  station: string;
  time_arrival: string | Date | null;
  order_index: number;
}
