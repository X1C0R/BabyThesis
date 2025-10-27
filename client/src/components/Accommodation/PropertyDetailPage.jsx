import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import axios from "axios";
import { showError } from "../../utils/modalUtils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const context = useOutletContext();
  const user = context?.user || null;
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // First try to get from user's hotels
        const response = await axios.get(`http://localhost:4000/hotels/${user?.id}`);
        
        if (response.data?.success && response.data?.hotels) {
          const foundProperty = response.data.hotels.find(h => h.id === parseInt(id));
          if (foundProperty) {
            setProperty(foundProperty);
          }
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        showError("Failed to load property details", "Error");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProperty();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate("/accommodation")}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  // Parse images
  const otherImages = property.others ? (typeof property.others === 'string' ? property.others.split(',') : property.others) : [];
  const allImages = [
    property.frontdisplay,
    property.room,
    ...otherImages
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Back Button */}
      <div className="border-b border-gray-200 sticky top-16 z-30 bg-white">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-8">
          <button
            onClick={() => navigate("/accommodation")}
            className="py-4 text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to properties</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1760px] mx-auto px-6 sm:px-8 py-10">
        {/* Airbnb-style Image Gallery */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-[400px] lg:h-[600px] mb-12 rounded-2xl overflow-hidden">
          {/* Large Featured Image - Left Side */}
          <div className="col-span-2 row-span-2 relative group">
            {allImages[0] ? (
              <img
                src={allImages[0]}
                alt={property.name}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl">
                🏨
              </div>
            )}
          </div>
          
          {/* Top Right Images */}
          <div className="relative group overflow-hidden">
            {allImages[1] ? (
              <img
                src={allImages[1]}
                alt={`${property.name} 2`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                📷
              </div>
            )}
          </div>
          <div className="relative group overflow-hidden">
            {allImages[2] ? (
              <img
                src={allImages[2]}
                alt={`${property.name} 3`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                📷
              </div>
            )}
          </div>
          
          {/* Bottom Right Images */}
          <div className="relative group overflow-hidden">
            {allImages[3] ? (
              <img
                src={allImages[3]}
                alt={`${property.name} 4`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                📷
              </div>
            )}
          </div>
          <div className="relative group overflow-hidden">
            {allImages.length > 4 ? (
              allImages[4] ? (
                <img
                  src={allImages[4]}
                  alt={`${property.name} 5`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : null
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                📷
              </div>
            )}
            {allImages.length > 5 && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center cursor-pointer hover:from-black/80 transition-colors">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white font-bold text-base">+{allImages.length - 5}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Published
                </span>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                {property.name}
              </h1>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg">{property.location}</span>
              </div>
            </div>

            <hr className="border-gray-200 my-8" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description || "No description provided."}
              </p>
            </div>

            <hr className="border-gray-200 my-8" />

            {/* Location Map Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              {property.latitude && property.longitude ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 h-[400px]">
                  <MapContainer
                    center={[property.latitude, property.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[property.latitude, property.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>{property.name}</strong><br />
                          {property.location}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl h-[400px] flex items-center justify-center border border-gray-200">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="font-medium mb-1">Location: {property.location}</p>
                    <p className="text-sm text-gray-400">Map coordinates not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Panel */}
          <div>
            <div className="sticky top-24 border border-gray-300 rounded-2xl p-6 shadow-lg">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-semibold text-gray-900">₱{parseInt(property.price).toLocaleString()}</span>
                  <span className="text-gray-600">night</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <button className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">
                  Edit Property
                </button>
                <button className="w-full py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                  View on Website
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Instant booking</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;

