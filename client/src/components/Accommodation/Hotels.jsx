import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch data from  backend
  const fetchHotels = async () => {
    try {
      const response = await fetch("http://localhost:4000/hotels");
      if (!response.ok) throw new Error("Failed to fetch hotels");

      const data = await response.json();
      setHotels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        🏨 All Hotels
      </h1>

      {loading && <p className="text-center">Loading hotels...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all"
            onClick={() => navigate(`/SelectedHotel/${hotel.id}`)}
          >
            {hotel.frontdisplay ? (
              <img
                src={hotel.frontdisplay}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            <h2 className="font-semibold text-lg text-gray-800">
              {hotel.name}
            </h2>
            <p className="text-gray-600">📍 {hotel.location}</p>
            <p className="text-gray-700 font-medium mt-2">💰 ₱{hotel.price}</p>
          </div>
        ))}
      </div>

      {!loading && hotels.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No hotels found in the database.
        </p>
      )}
    </div>
  );
};

export default Hotels;
