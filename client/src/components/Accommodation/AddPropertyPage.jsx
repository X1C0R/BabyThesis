import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AddHotels from "./AddHotels";
import { showSuccess } from "../../utils/modalUtils";

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const user = context?.user || null;

  const handlePropertyAdded = () => {
    showSuccess("Property added successfully!", "Success");
    navigate("/accommodation");
  };

  if (!user || user.role?.toUpperCase() !== "LANDLORD" || !user.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need to be an approved landlord to access this page.
          </p>
          <button 
            className="nav-button primary"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/accommodation")}
            className="mb-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Properties</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Add New Property
              </h1>
              <p className="text-gray-600 text-lg">
                Fill in the details below to list your accommodation
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <AddHotels onSuccess={handlePropertyAdded} />
        </div>
      </div>
    </div>
  );
};

export default AddPropertyPage;

