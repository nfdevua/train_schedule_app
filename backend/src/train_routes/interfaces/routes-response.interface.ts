import { IRouteResponse } from './route-response.interface';

export interface IRoutesResponse {
  routes: IRouteResponse[];
  total: number;
  totalPages: number;
}
