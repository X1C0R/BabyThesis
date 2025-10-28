import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import MyHotels from "./MyHotels";

const Accommodation = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const user = context?.user || null;

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
    <div className="min-h-screen bg-white pt-16">
      {/* Modern Header */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Your properties
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and grow your accommodation listings
              </p>
            </div>
            <button 
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
              onClick={() => navigate("/add-property")}
            >
              + Add new property
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1760px] mx-auto px-6 sm:px-8 py-10">
        <MyHotels />
      </div>
      <div className="text-center text-2xl mt-1.5">
      {/* <h1>My Accomodation</h1> */}
      </div>
    {/* {ShowAddHotels && 
      <AddHotels/>} */}
{/* 
    <MyHotels/> */}
    </div>
  );
};

export default Accommodation;
