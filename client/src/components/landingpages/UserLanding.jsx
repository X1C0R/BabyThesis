import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import { supabase } from "../supabased/supabasedClient";

const UserLanding = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user session and role/approval from users table
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      if (!currentUser) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      // Fetch role and approval from users table
      const { data, error } = await supabase
        .from("users")
        .select("role, is_approved")
        .eq("id", currentUser.id)
        .single();

      if (!error && data) {
        setUser({ ...currentUser, ...data });
      } else {
        setUser(currentUser); // fallback if error
      }
      setLoadingUser(false);
    };

    fetchUserData();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(prev => ({ ...prev, ...session.user }));
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const LogOut = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/");
    }
  };

  const handleMyAccommodation = () => {
    if (user?.role?.toUpperCase() === "LANDLORD" && user?.is_approved) {
      navigate("/accommodation");
    } else {
      alert(
        "Your account is not yet approved by the admin. Please wait for approval."
      );
    }
  };

  if (loadingUser) return <p>Loading user...</p>;

  return (
    <div className="flex flex-row justify-center items-center">
      <div className="flex flex-row justify-between items-center pr-10 w-full h-fit mt-5">
        <img src={logo} alt="logo" className="w-45" />
        <div className="flex justify-center gap-35">
          <button className="nav-button">Hotels</button>
          <button className="nav-button">Apartments</button>
          <button className="nav-button">Dormitory</button>

          {/* Role-based buttons */}
          {user?.role?.toUpperCase() === "LANDLORD" && user?.is_approved && (
            <button
              className="nav-button whitespace-nowrap"
              onClick={handleMyAccommodation}
            >
              My Accommodations
            </button>
          )}

          {user?.role?.toUpperCase() === "ADMIN" && (
            <button
              className="nav-button"
              onClick={() => navigate("/AdminProvesAccounts")}
            >
              Reservation
            </button>
          )}
        </div>

        {/* Login/Logout */}
        {!user ? (
          <button className="nav-button" onClick={() => navigate("/login")}>
            Login
          </button>
        ) : (
          <button className="nav-button" onClick={LogOut}>
            Log-out
          </button>
        )}
        <button className="nav-button">Profile</button>
      </div>
    </div>
  );
};

export default UserLanding;
