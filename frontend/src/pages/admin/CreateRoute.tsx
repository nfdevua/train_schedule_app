import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { routesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import RouteForm from "../../components/RouteForm";
import PageHeader from "../../components/PageHeader";
import "./Admin.css";

const CreateRoute: React.FC = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await routesAPI.createRoute(data);
      setSuccess("Route created successfully!");
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400) {
        setError(message || "Invalid route data");
      } else if (status === 409) {
        setError(message || "Route already exists");
      } else {
        setError(message || "Failed to create route. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <PageHeader
        title="Create New Route"
        onLogout={handleLogout}
        showDashboard={true}
        className="admin-header"
      />

      <main className="admin-main">
        <div className="admin-card">
          <RouteForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Route"
            isSubmitting={loading}
            error={error}
            success={success}
          />
        </div>
      </main>
    </div>
  );
};

export default CreateRoute;
