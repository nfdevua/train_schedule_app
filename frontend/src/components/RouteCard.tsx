import React from "react";
import { TrainRoute } from "../services/api";
import { formatTime, formatDate } from "../utils/timeUtils";
import "./RouteCard.css";

interface RouteCardProps {
  route: TrainRoute;
  onRouteClick: (routeId: string) => void;
  onAddToFavorites?: (routeId: string) => void;
  onRemoveFromFavorites?: (routeId: string) => void;
  isInFavorites?: boolean;
  isAddingToFavorites?: boolean;
  showAdminActions?: boolean;
  onEditRoute?: (routeId: string) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({
  route,
  onRouteClick,
  onAddToFavorites,
  onRemoveFromFavorites,
  isInFavorites = false,
  isAddingToFavorites = false,
  showAdminActions = false,
  onEditRoute,
}) => {
  const handleToggleFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInFavorites && onRemoveFromFavorites) {
      onRemoveFromFavorites(route.id);
    } else if (!isInFavorites && onAddToFavorites) {
      onAddToFavorites(route.id);
    }
  };

  return (
    <div
      className="route-card"
      onClick={() => onRouteClick(route.id)}
      style={{ cursor: "pointer" }}
    >
      <div className="route-header">
        <span className="train-number">Train: {route.train_number}</span>
        <span className="train-type">{route.train_type}</span>
      </div>

      <div className="route-journey">
        <div className="station">
          <div className="station-name">{route.departure_station}</div>
          <div className="time">{formatTime(route.departure_time)}</div>
          <div className="date">{formatDate(route.departure_time)}</div>
        </div>

        <div className="journey-arrow">→</div>

        <div className="station">
          <div className="station-name">{route.arrival_station}</div>
          <div className="time">{formatTime(route.arrival_time)}</div>
          <div className="date">{formatDate(route.arrival_time)}</div>
        </div>
      </div>

      {route.stops && route.stops.length > 0 && (
        <div className="route-stops-preview">
          <div className="stops-label">Stops:</div>
          <div className="stops-list">
            {route.stops.slice(0, 3).map((stop, index) => (
              <span key={stop.id} className="stop-preview">
                {stop.station}
                {index < Math.min(route.stops?.length || 0, 3) - 1 && " "}
              </span>
            ))}
            {route.stops.length > 3 && (
              <span className="more-stops">+{route.stops.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      <div className="route-details">
        <span className="price">${route.price}</span>
        <span className="seats">
          {route.total_available_seats} seats available
        </span>

        {(onAddToFavorites || onRemoveFromFavorites) && (
          <button
            onClick={handleToggleFavorites}
            className="favorites-btn"
            disabled={isAddingToFavorites}
          >
            {isAddingToFavorites
              ? "..."
              : isInFavorites
              ? "❤️ Remove"
              : "🤍 Add"}
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRouteClick(route.id);
          }}
          className="view-details-btn"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default RouteCard;
