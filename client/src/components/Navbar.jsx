import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./images/logo.png";
import { showError } from "../utils/modalUtils";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleMyAccommodation = () => {
    if (user?.role?.toUpperCase() === "LANDLORD" && user?.is_approved) {
      navigate("/accommodation");
    } else {
      showError(
        "Your account is not yet approved by the admin. Please wait for approval.",
        "Access Denied"
      );
    }
  };

  return (
    <nav className="bg-white fixed top-0 left-0 right-0  border-b-2 border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="AccommodationHub Logo" 
              className="h-10 w-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
            <span className="ml-3 text-gray-900 font-bold text-xl hidden sm:block">
              AccommodationHub
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <button 
              className="nav-button"
              onClick={() => navigate("/")}
            >
              🏠 Home
            </button>
            <button className="nav-button">
              🏨 Hotels
            </button>
            <button className="nav-button">
              🏢 Apartments
            </button>
            <button className="nav-button">
              🏫 Dormitory
            </button>

            {/* Role-based buttons */}
            {user?.role?.toUpperCase() === "LANDLORD" && user?.is_approved && (
              <button
                className="nav-button whitespace-nowrap"
                onClick={handleMyAccommodation}
              >
                🏠 My Accommodations
              </button>
            )}

            {user?.role?.toUpperCase() === "ADMIN" && (
              <button
                className="nav-button"
                onClick={() => navigate("/AdminProvesAccounts")}
              >
                📋 Admin Panel
              </button>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {!user ? (
              <button 
                className="nav-button primary" 
                onClick={() => navigate("/login")}
              >
                🔐 Login
              </button>
            ) : (
              <>
                <button 
                  className="nav-button"
                  onClick={() => navigate("/profile")}
                >
                  👤 Profile
                </button>
                <button 
                  className="nav-button" 
                  onClick={onLogout}
                >
                  🚪 Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="nav-button">
              ☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

