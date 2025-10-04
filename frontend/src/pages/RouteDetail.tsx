import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { routesAPI, favoritesAPI, TrainRoute } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { formatTime } from "../utils/timeUtils";
import "./RouteDetail.css";

const RouteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<TrainRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [checkingFavoriteStatus, setCheckingFavoriteStatus] = useState(true);
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoute = async () => {
      if (!id) {
        setError("Route ID not provided");
        setLoading(false);
        return;
      }

      try {
        const routeData = await routesAPI.getRouteById(id);
        setRoute(routeData);
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 404) {
          setError("Nothing found - Route not found");
        } else {
          setError("Failed to fetch route details");
        }
        console.error("Error fetching route:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      if (!id) return;

      try {
        setCheckingFavoriteStatus(true);
        const favorites = await favoritesAPI.getFavorites();
        const isFavorite = favorites.favorites.some(
          (fav) => fav.route_id === id
        );
        setIsInFavorites(isFavorite);
      } catch (err: any) {
        console.error("Error checking favorite status:", err);
        setIsInFavorites(false);
      } finally {
        setCheckingFavoriteStatus(false);
      }
    };

    fetchRoute();
    checkFavoriteStatus();
  }, [id]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleFavorites = async () => {
    if (!id || !route) return;

    setAddingToFavorites(true);

    try {
      await favoritesAPI.toggleFavorites(id);
      // Toggle the favorite status
      setIsInFavorites(!isInFavorites);
    } catch (err: any) {
      console.error("Error toggling favorite:", err);
      // Optionally show error message to user
    } finally {
      setAddingToFavorites(false);
    }
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  const calculateTimeBetweenStations = (fromTime: string, toTime: string) => {
    if (!fromTime || !toTime) {
      return "N/A";
    }

    const from = new Date(fromTime);
    const to = new Date(toTime);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return "N/A";
    }

    const diffMs = to.getTime() - from.getTime();

    if (diffMs < 0) {
      return "N/A";
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="route-detail">
        <div className="loading">Loading route details...</div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="route-detail">
        <div className="error-container">
          <div className="error-message">
            {error || "Nothing found - Route not found"}
          </div>
          <button onClick={handleBack} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="route-detail">
      <header className="detail-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBack} className="back-button">
              ← Back to Dashboard
            </button>
            <h1>Route Details</h1>
          </div>
          <div className="header-actions">
            <Link to="/favorites" className="nav-button">
              My Favorites
            </Link>
            {isAdmin && (
              <Link to="/admin/create-route" className="nav-button">
                Create Route
              </Link>
            )}
            {isAdmin && (
              <Link to={`/admin/edit-route/${route.id}`} className="nav-button">
                Edit Route
              </Link>
            )}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="detail-main">
        <div className="route-card-detail">
          <div className="route-header-detail">
            <div className="train-info">
              <h2>Train {route.train_number}</h2>
              <span className="train-type-badge">{route.train_type}</span>
            </div>
            <div className="favorites-and-price">
              <div className="favorites-section-inline">
                <button
                  onClick={handleToggleFavorites}
                  className="favorites-button"
                  disabled={addingToFavorites || checkingFavoriteStatus}
                >
                  {addingToFavorites
                    ? "..."
                    : checkingFavoriteStatus
                    ? "Checking..."
                    : isInFavorites
                    ? "❤️ Remove from Favorites"
                    : "🤍 Add to Favorites"}
                </button>
              </div>
              <div className="price-info">
                <span className="price-label">Price</span>
                <span className="price-value">${route.price}</span>
              </div>
            </div>
          </div>

          <div className="journey-detail">
            <div className="journey-header">
              <div className="journey-title">Journey Details</div>
              <div className="journey-duration">
                <span className="duration-label">Total Duration</span>
                <span className="duration-value">
                  {calculateDuration(route.departure_time, route.arrival_time)}
                </span>
              </div>
            </div>
            <div className="journey-timeline">
              <div className="timeline-item departure">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="station-name">{route.departure_station}</div>
                  <div className="station-datetime">
                    <div className="station-time">
                      {formatTime(route.departure_time)}
                    </div>
                    <div className="station-date">
                      {new Date(route.departure_time).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="station-label">Departure</div>
                </div>
              </div>

              {/* Connector from departure to first stop or arrival */}
              {route.stops && route.stops.length > 0 ? (
                <div className="timeline-connector">
                  <div className="connector-line"></div>
                  <div className="duration">
                    {calculateTimeBetweenStations(
                      route.departure_time,
                      route.stops[0]?.time_arrival || route.arrival_time
                    )}
                  </div>
                </div>
              ) : (
                <div className="timeline-connector">
                  <div className="connector-line"></div>
                  <div className="duration">
                    {calculateTimeBetweenStations(
                      route.departure_time,
                      route.arrival_time
                    )}
                  </div>
                </div>
              )}

              {route.stops && route.stops.length > 0 && (
                <>
                  {route.stops.map((stop, index) => (
                    <div key={stop.id}>
                      <div className="timeline-item stop">
                        <div className="timeline-dot stop-dot"></div>
                        <div className="timeline-content">
                          <div className="station-name">{stop.station}</div>
                          <div className="station-datetime">
                            {stop.time_arrival && (
                              <>
                                <div className="station-time">
                                  {formatTime(stop.time_arrival)}
                                </div>
                                <div className="station-date">
                                  {new Date(
                                    stop.time_arrival
                                  ).toLocaleDateString()}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="station-label">Stop {index + 1}</div>
                        </div>
                      </div>

                      {/* Connector to next stop or arrival */}
                      {route.stops && index < route.stops.length - 1 ? (
                        <div className="timeline-connector">
                          <div className="connector-line"></div>
                          <div className="duration">
                            {calculateTimeBetweenStations(
                              stop.time_arrival || route.departure_time,
                              route.stops[index + 1]?.time_arrival ||
                                route.arrival_time
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="timeline-connector">
                          <div className="connector-line"></div>
                          <div className="duration">
                            {calculateTimeBetweenStations(
                              stop.time_arrival || route.departure_time,
                              route.arrival_time
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              <div className="timeline-item arrival">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="station-name">{route.arrival_station}</div>
                  <div className="station-datetime">
                    <div className="station-time">
                      {formatTime(route.arrival_time)}
                    </div>
                    <div className="station-date">
                      {new Date(route.arrival_time).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="station-label">Arrival</div>
                </div>
              </div>
            </div>
          </div>

          <div className="route-info-grid">
            <div className="info-item">
              <div className="info-label">Available Seats</div>
              <div className="info-value">{route.total_available_seats}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Train Type</div>
              <div className="info-value">{route.train_type}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RouteDetail;
