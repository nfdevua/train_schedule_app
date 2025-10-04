import axios from "axios";
import { cookieUtils } from "../utils/cookies";
import { toUTCString } from "../utils/timeUtils";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = cookieUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      cookieUtils.clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types
export enum TrainType {
  EXPRESS = "express",
  METRO = "metro",
  SUBURBAN = "suburban",
  REGIONAL = "regional",
  INTERCITY = "intercity",
  HIGH_SPEED = "high_speed",
}

export interface User {
  id: string;
  username: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  role: string;
  access_token: string;
}

export interface RouteStop {
  id: string;
  station: string;
  time_arrival: string | null;
  order_index: number;
  route_id: string;
  created_at: string;
  updated_at: string;
}

export interface TrainRoute {
  id: string;
  train_number: string;
  train_type: TrainType;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  total_available_seats: number;
  stops?: RouteStop[];
  created_at: string;
  updated_at: string;
}

export interface CreateRouteRequest {
  train_number: string;
  train_type: TrainType;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  total_available_seats: number;
  stops?: Omit<RouteStop, "id" | "route_id" | "created_at" | "updated_at">[];
}

export interface UpdateRouteRequest extends CreateRouteRequest {
  id: string;
}

export interface TrainRoutesResponse {
  routes: TrainRoute[];
  total: number;
  totalPages: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  route_id: string;
  created_at: string;
  updated_at: string;
  route?: TrainRoute;
}

export interface FavoritesResponse {
  favorites: Favorite[];
  total: number;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.access_token) {
      cookieUtils.setToken(response.data.access_token);
    }
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    console.log(API_BASE_URL, " url");
    const response = await api.post("/auth/register", userData);
    if (response.data.access_token) {
      cookieUtils.setToken(response.data.access_token);
    }
    return response.data;
  },
};

// Train Routes API
export const routesAPI = {
  getRoutes: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    departure_station?: string;
    arrival_station?: string;
    train_type?: TrainType;
    departure_date?: string;
    arrival_date?: string;
  }): Promise<TrainRoutesResponse & { page: number; limit: number }> => {
    const limit = params?.limit || 10;
    const page = params?.page || 1;

    const backendParams = {
      ...params,
      offset: (page - 1) * limit,
    };
    delete backendParams.page;

    const response = await api.get("/route/list", { params: backendParams });

    return {
      ...response.data,
      page,
      limit,
    };
  },

  getRouteById: async (id: string): Promise<TrainRoute> => {
    const response = await api.get(`/route/${id}`);
    return response.data;
  },

  createRoute: async (routeData: CreateRouteRequest): Promise<TrainRoute> => {
    const backendData = {
      train_number: routeData.train_number,
      train_type: routeData.train_type,
      departure_station: routeData.departure_station,
      arrival_station: routeData.arrival_station,
      departure_time: toUTCString(routeData.departure_time),
      arrival_time: toUTCString(routeData.arrival_time),
      price: routeData.price,
      total_available_seats: routeData.total_available_seats,
      stops: routeData.stops?.map((stop) => ({
        ...stop,
        time_arrival: stop.time_arrival ? toUTCString(stop.time_arrival) : null,
      })),
    };

    const response = await api.post("/route", backendData);

    return response.data;
  },

  updateRoute: async (
    id: string,
    routeData: UpdateRouteRequest
  ): Promise<TrainRoute> => {
    const backendData = {
      id,
      train_number: routeData.train_number,
      train_type: routeData.train_type,
      departure_station: routeData.departure_station,
      arrival_station: routeData.arrival_station,
      departure_time: toUTCString(routeData.departure_time),
      arrival_time: toUTCString(routeData.arrival_time),
      price: routeData.price,
      total_available_seats: routeData.total_available_seats,
      stops: routeData.stops?.map((stop) => ({
        ...stop,
        time_arrival: stop.time_arrival ? toUTCString(stop.time_arrival) : null,
      })),
    };

    const response = await api.patch("/route", backendData);

    return response.data;
  },

  deleteRoute: async (id: string): Promise<void> => {
    await api.delete("/route", { data: { id } });
  },
};

// Favorites API
export const favoritesAPI = {
  getFavorites: async (): Promise<FavoritesResponse> => {
    const response = await api.get("/users/favorites");
    return response.data;
  },

  toggleFavorites: async (route_id: string): Promise<Favorite> => {
    const response = await api.post("/users/favorites", {
      route_id,
    });
    return response.data;
  },
};

export default api;
