import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SearchHotels = () => {
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the query parameter (?location=xxx)
  const queryParams = new URLSearchParams(location.search);
  const searchLocation = queryParams.get("location");

  useEffect(() => {
    const fetchHotelsByLocation = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:4000/search?location=${encodeURIComponent(
            searchLocation
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch hotels");

        const data = await response.json();
        setHotels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchLocation) fetchHotelsByLocation();
  }, [searchLocation]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Search Results for "{searchLocation}"
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading hotels...</p>
      ) : hotels.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
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

              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-800">
                  {hotel.name}
                </h2>
                <p className="text-gray-600">📍 {hotel.location}</p>
                <p className="text-gray-700 font-medium mt-2">
                  💰 ₱{hotel.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          No hotels found for "{searchLocation}".
        </p>
      )}
    </div>
  );
};

export default SearchHotels;
