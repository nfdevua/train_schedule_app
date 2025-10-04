import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RouteDetail from "./pages/RouteDetail";
import FavoritesList from "./pages/FavoritesList";
import CreateRoute from "./pages/admin/CreateRoute";
import EditRoute from "./pages/admin/EditRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/route/:id"
              element={
                <PrivateRoute>
                  <RouteDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <FavoritesList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/create-route"
              element={
                <AdminRoute>
                  <CreateRoute />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/edit-route/:id"
              element={
                <AdminRoute>
                  <EditRoute />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
