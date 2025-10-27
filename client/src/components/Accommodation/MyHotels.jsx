import React, { useEffect, useState } from "react";
import { supabase } from "../supabased/supabasedClient";
import { useAuth } from "../AuthProvider";

const MyHotels = () => {
  const { user, loadingUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null); // Track deleting hotel

  useEffect(() => {
    const fetchHotels = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("hotels")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setHotels(data);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [user]);


  const handleDelete = async (hotelId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this hotel?"
    );
    if (!confirmDelete) return;

    setDeleting(hotelId);

    try {
      const { error } = await supabase.from("hotels").delete().eq("id", hotelId);
      if (error) throw error;

      // Remove from state instantly (no refetch needed)
      setHotels((prev) => prev.filter((h) => h.id !== hotelId));
      alert("Hotel deleted successfully!");
    } catch (err) {
      console.error("Error deleting hotel:", err);
      alert("Failed to delete hotel.");
    } finally {
      setDeleting(null);
    }
  };

  if (loadingUser) return <p>Loading user session...</p>;
  if (!user) return <p>You must be logged in to see your hotels.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">My Hotels</h1>

      {loading && <p>Loading hotels...</p>}

      {hotels.length === 0 && !loading && <p>No hotels found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{hotel.name}</h2>
            <p className="text-gray-600">{hotel.description}</p>
            <p className="mt-2">
              <strong>Location:</strong> {hotel.location}
            </p>
            <p>
              <strong>Price:</strong> ${hotel.price}
            </p>
            {hotel.frontdisplay && (
              <img
                src={hotel.frontdisplay}
                alt={hotel.name}
                className="mt-2 rounded"
              />
            )}

            {/* 🗑️ Delete Button */}
            <button
              onClick={() => handleDelete(hotel.id)}
              disabled={deleting === hotel.id}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:bg-gray-400"
            >
              {deleting === hotel.id ? "Deleting..." : "Delete Hotel"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyHotels;
