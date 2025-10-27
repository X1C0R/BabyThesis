import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabased/supabasedClient";
import Navbar from "../Navbar";
import AddHotels from "./AddHotels";
import MyHotels from "./MyHotels";

const Accommodation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [ShowAddHotels, setShowAddHotels] = useState(false);

  // Fetch user session and role/approval from users table
 useEffect(() => {
  const fetchUserData = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user;
    if (!currentUser) {
      setUser(null);
      setLoadingUser(false);
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("role, is_approved")
      .eq("id", currentUser.id)
      .single();

    if (!error && data) {
      setUser({ ...currentUser, ...data });
    } else {
      setUser(currentUser);
    }
    setLoadingUser(false);
  };

  fetchUserData();

  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      // refetch full user info to get role & approval
      const { data, error } = await supabase
        .from("users")
        .select("role, is_approved")
        .eq("id", session.user.id)
        .single();

      if (!error && data) {
        setUser({ ...session.user, ...data });
      } else {
        setUser(session.user);
      }
    } else {
      setUser(null);
      navigate("/login");
    }
  });

  return () => listener.subscription.unsubscribe();
}, [navigate]);

  const LogOut = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/");
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={LogOut} />
      
      <div className="pt-16">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Accommodations
                </h1>
                <p className="text-gray-600">
                  Manage your hotels, apartments, and dormitories
                </p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <button 
                  className="nav-button primary"
                  onClick={() => setShowAddHotels(!ShowAddHotels)}
                >
                  ➕ Add New Property
                </button>
                <button className="nav-button">
                  📊 Analytics
                </button>
                <button className="nav-button">
                  📋 Reservations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {ShowAddHotels && (
            <div className="mb-8">
              <div className="form-container p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Add New Property
                </h2>
                <AddHotels />
              </div>
            </div>
          )}

          {/* Properties List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Properties
              </h2>
            </div>
            <div className="p-6">
              <MyHotels />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-2xl mt-1.5">
      {/* <h1>My Accomodation</h1> */}
      </div>
    {ShowAddHotels && 
      <AddHotels/>}
{/* 
    <MyHotels/> */}
    </div>
  );
};

export default Accommodation;
