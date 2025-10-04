import React from "react";
import { Link } from "react-router-dom";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  onLogout: () => void;
  userRole?: string | null;
  showFavorites?: boolean;
  showCreateRoute?: boolean;
  showDashboard?: boolean;
  showCreateButton?: boolean;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onLogout,
  userRole,
  showFavorites = false,
  showCreateRoute = false,
  showDashboard = true,
  showCreateButton = false,
  className = "dashboard-header",
}) => {
  return (
    <header className={className}>
      <div className="header-content">
        <h1>{title}</h1>
        <div className="header-actions">
          {showFavorites && (
            <Link to="/favorites" className="nav-button">
              My Favorites
            </Link>
          )}
          {showCreateRoute && (
            <Link to="/admin/create-route" className="nav-button admin-button">
              Create Route
            </Link>
          )}
          {showDashboard && (
            <Link to="/dashboard" className="nav-button">
              Dashboard
            </Link>
          )}
          {showCreateButton && (
            <Link to="/admin/create-route" className="nav-button admin-button">
              Create Route
            </Link>
          )}
          <button onClick={onLogout} className="logout-button">
            Logout{userRole ? ` (${userRole})` : ""}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
