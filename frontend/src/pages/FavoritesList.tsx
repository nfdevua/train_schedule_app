import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { favoritesAPI, Favorite } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import RouteCard from "../components/RouteCard";
import PageHeader from "../components/PageHeader";
import "./Dashboard.css";

const FavoritesList: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingFromFavorites, setRemovingFromFavorites] = useState<
    string | null
  >(null);
  const { logout, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getFavorites();

      if (response.favorites.length === 0) {
        setFavorites([]);
        setError("Not found");
      } else {
        setFavorites(response.favorites);
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) {
        setError("Not found");
      } else {
        setError("Failed to load favorites");
      }
      if (err.response?.status !== 404) {
        console.error("Error fetching favorites:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (routeId: string) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this route from favorites?"
    );

    if (!confirmRemove) return;

    setRemovingFromFavorites(routeId);
    setError("");

    try {
      await favoritesAPI.toggleFavorites(routeId);
      // Refresh the favorites list after successful removal
      await fetchFavorites();
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setError("This route is already removed from your favorites");
      } else {
        setError(message || "Failed to remove from favorites");
      }
      console.error("Error removing favorite:", err);
    } finally {
      setRemovingFromFavorites(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRouteClick = (routeId: string) => {
    navigate(`/route/${routeId}`);
  };

  return (
    <div className="dashboard">
      <PageHeader
        title="My Favorite Routes"
        onLogout={handleLogout}
        userRole={userRole}
        showDashboard={true}
        showCreateRoute={isAdmin}
      />

      <main className="dashboard-main">
        {loading ? (
          <div className="loading">Loading your favorites...</div>
        ) : error === "Not found" ? (
          <div className="empty-state">
            <h3>Not found</h3>
            <p>You haven't added any routes to your favorites yet.</p>
            <Link to="/dashboard" className="btn btn-primary">
              Browse Routes
            </Link>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="routes-header">
              <h2>Favorite Routes ({favorites.length} found)</h2>
            </div>

            <div className="routes-list">
              {favorites.map((favorite) => (
                <RouteCard
                  key={favorite.id}
                  route={favorite.route!}
                  onRouteClick={handleRouteClick}
                  onRemoveFromFavorites={handleRemoveFavorite}
                  isInFavorites={true}
                  isAddingToFavorites={
                    removingFromFavorites === favorite.route?.id
                  }
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FavoritesList;
