import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";

const MyHotels = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const user = context?.user || null;
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      console.log("MyHotels useEffect triggered, user:", user);
      
      if (!user) {
        console.log("No user, setting loading to false");
        setLoading(false);
        setHotels([]);
        return;
      }

      console.log("User exists, fetching hotels for user ID:", user.id);
      setLoading(true);
      
      try {
        console.log("Calling backend API...");
        const response = await axios.get(`http://localhost:4000/hotels/${user.id}`);
        
        console.log("API response received:", response.data);
        console.log("Number of hotels:", response.data?.hotels?.length || 0);
        setHotels(response.data?.hotels || []);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setHotels([]);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    fetchHotels();
  }, [user]);

  console.log("MyHotels render - loading:", loading, "hotels count:", hotels.length, "user:", user?.id);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
        <p className="mt-6 text-gray-600 font-medium">Loading your properties...</p>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="text-7xl mb-6">🏠</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No properties yet</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Get started by creating your first listing. It's quick and easy!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {hotels.map((hotel) => {
        // Parse multiple images from stored string
        const otherImages = hotel.others ? (typeof hotel.others === 'string' ? hotel.others.split(',') : hotel.others) : [];
        
        return (
          <div
            key={hotel.id}
            className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
          >
            {/* Property Image */}
            <div className="relative h-[300px] overflow-hidden mb-3">
              {hotel.frontdisplay ? (
                <img
                  src={hotel.frontdisplay}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-6xl">
                  🏨
                </div>
              )}
              {otherImages.length > 0 && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                  +{otherImages.length} photos
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="px-4 pb-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{hotel.location}</p>
                </div>
              </div>
              
              {hotel.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {hotel.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900">₱{parseInt(hotel.price).toLocaleString()}</span>
                  <span className="text-gray-600 text-sm">/night</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit property"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => navigate(`/property/${hotel.id}`)}
                    className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View details"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyHotels;
