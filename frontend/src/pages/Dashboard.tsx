import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { routesAPI, TrainRoute, TrainType } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import RouteCard from "../components/RouteCard";
import PageHeader from "../components/PageHeader";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const [routes, setRoutes] = useState<TrainRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [train_type, setTrainType] = useState<TrainType | "">("");
  const [departure_date, setDepartureDate] = useState("");
  const [arrival_date, setArrivalDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { userRole, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const limit = 10;

  const fetchRoutes = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError("");

      try {
        const params: any = {
          page,
          limit,
        };

        if (search && search.trim()) {
          params.search = search.trim();
        }
        if (train_type) {
          params.train_type = train_type;
        }
        if (departure_date) {
          params.departure_date = departure_date;
        }
        if (arrival_date) {
          params.arrival_date = arrival_date;
        }

        const response = await routesAPI.getRoutes(params);

        if (response.routes.length === 0) {
          setRoutes([]);
          setTotal(0);
          setTotalPages(0);
          setCurrentPage(1);
          setError("Not found");
        } else {
          setRoutes(response.routes);
          setTotal(response.total);
          setTotalPages(Math.ceil(response.total / limit));
          setCurrentPage(page);
        }
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 404) {
          setError("Not found");
        } else {
          setError("Failed to fetch train routes");
        }
        if (err.response?.status !== 404) {
          console.error("Error fetching routes:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [search, train_type, departure_date, arrival_date, limit]
  );

  useEffect(() => {
    fetchRoutes(1);
  }, [search, train_type, departure_date, arrival_date, fetchRoutes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRoutes(1);
  };

  const handlePageChange = (page: number) => {
    fetchRoutes(page);
  };

  const handleRouteClick = (routeId: string) => {
    navigate(`/route/${routeId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const clearFilters = () => {
    setSearch("");
    setTrainType("");
    setDepartureDate("");
    setArrivalDate("");
    setCurrentPage(1);
  };

  return (
    <div className="dashboard">
      <PageHeader
        title="Train Schedule Dashboard"
        onLogout={handleLogout}
        userRole={userRole}
        showFavorites={true}
        showCreateRoute={isAdmin}
      />

      <main className="dashboard-main">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-row">
              <input
                type="text"
                placeholder="Search by train number, departure or arrival station..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select
                value={train_type}
                onChange={(e) => setTrainType(e.target.value as TrainType | "")}
                className="search-input"
              >
                <option value="">All train types</option>
                <option value={TrainType.EXPRESS}>Express</option>
                <option value={TrainType.METRO}>Metro</option>
                <option value={TrainType.SUBURBAN}>Suburban</option>
                <option value={TrainType.REGIONAL}>Regional</option>
                <option value={TrainType.INTERCITY}>Intercity</option>
                <option value={TrainType.HIGH_SPEED}>High Speed</option>
              </select>
              <div className="date-input-group">
                <label className="date-label">Departure Date</label>
                <input
                  type="date"
                  value={departure_date}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="date-input-group">
                <label className="date-label">Arrival Date</label>
                <input
                  type="date"
                  value={arrival_date}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="clear-button"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="loading">Loading train routes...</div>
        ) : error === "Not found" ? (
          <div className="empty-state">
            <h3>Not found</h3>
            <p>No train routes match your search criteria.</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="routes-header">
              <h2>Train Routes ({total} found)</h2>
              {isAdmin && (
                <div className="admin-actions">
                  <Link to="/admin/create-route" className="btn btn-primary">
                    + Add New Route
                  </Link>
                </div>
              )}
            </div>

            <div className="routes-list">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onRouteClick={handleRouteClick}
                  showAdminActions={isAdmin}
                  onEditRoute={(routeId) =>
                    navigate(`/admin/edit-route/${routeId}`)
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
