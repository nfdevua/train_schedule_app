import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { routesAPI, TrainRoute } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import RouteForm from "../../components/RouteForm";
import PageHeader from "../../components/PageHeader";
import "./Admin.css";

const EditRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<TrainRoute | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { logout } = useAuth();
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

    fetchRoute();
  }, [id]);

  const handleSubmit = async (data: any) => {
    if (!id) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updateData = { ...data, id };

      updateData.departure_time = new Date(updateData.departure_time);
      updateData.arrival_time = new Date(updateData.arrival_time);

      if (updateData.stops && Array.isArray(updateData.stops)) {
        updateData.stops = updateData.stops.map((stop: any) => ({
          ...stop,
          time_arrival: stop.time_arrival ? new Date(stop.time_arrival) : null,
        }));
      }

      const updatedRoute = await routesAPI.updateRoute(id, updateData);
      setRoute(updatedRoute);
      setSuccess("Route updated successfully!");
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400) {
        setError(message || "Invalid route data");
      } else if (status === 404) {
        setError(message || "Route not found");
      } else {
        setError(message || "Failed to update route. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !route) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete route ${route.train_number}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setError("");
    setDeleting(true);

    try {
      await routesAPI.deleteRoute(id);
      navigate("/dashboard", {
        state: { message: `Route ${route.train_number} deleted successfully` },
      });
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 404) {
        setError(message || "Route not found");
      } else {
        setError(message || "Failed to delete route. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading route details...</div>
      </div>
    );
  }

  if (error && !route) {
    return (
      <div className="admin-container">
        <div className="admin-main">
          <div className="admin-card">
            <div className="error-message">{error}</div>
            <div className="form-actions">
              <Link to="/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <PageHeader
        title={`Edit Route: ${route?.train_number}`}
        onLogout={handleLogout}
        showDashboard={true}
        showCreateButton={true}
        className="admin-header"
      />

      <main className="admin-main">
        <div className="admin-card">
          <RouteForm
            initialData={route || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText="Update Route"
            isSubmitting={saving}
            error={error}
            success={success}
            showDeleteButton={true}
            onDelete={handleDelete}
            isDeleting={deleting}
          />
        </div>
      </main>
    </div>
  );
};

export default EditRoute;
