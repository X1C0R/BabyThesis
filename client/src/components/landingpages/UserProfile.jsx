import React, { useEffect, useState } from "react";
import { supabase } from "../supabased/supabasedClient";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {

        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        const userId = data?.session?.user?.id;

        if (!token || !userId) {
          setError("No active session found. Please log in again.");
          setLoading(false);
          return;
        }


        const res = await fetch(`http://localhost:4000/UserProfile/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to fetch profile");
        }

        setProfile(result.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-20 text-gray-500">
        No profile found.
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          👤 User Profile
        </h2>

        <div className="space-y-4 text-gray-700">
          <div>
            <p className="text-sm font-semibold text-gray-500">Full Name</p>
            <p className="text-lg">{profile.full_name || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">Email</p>
            <p className="text-lg">{profile.email}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">Role</p>
            <p className="text-lg capitalize">{profile.role || "User"}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Account Status
            </p>
            <p
              className={`text-lg font-medium ${
                profile.is_approved ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {profile.is_approved ? "Approved" : "Pending Approval"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
