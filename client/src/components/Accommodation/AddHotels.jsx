import React, { useState } from "react";
import axios from "axios";
import { showSuccess, showError } from "../../utils/modalUtils";
import { useOutletContext } from "react-router-dom";

const AddHotels = ({ onSuccess}) => {
    const context = useOutletContext();
    const user = context?.user;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [frontdisplay, setFrontdisplay] = useState(null);
  const [room, setRoom] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Manila boundary box (approximate)
  const manilaBounds = {
    north: 14.7100,
    south: 14.4700,
    east: 121.0600,
    west: 120.9000,
  };

  const isInsideManila = (lat, lon) => {
    return (
      lat >= manilaBounds.south &&
      lat <= manilaBounds.north &&
      lon >= manilaBounds.west &&
      lon <= manilaBounds.east
    );
  };

  // Validate typed location via Nominatim
  const validateLocation = async () => {
    if (!location.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}`
      );
      const data = await res.json();

      if (data.length === 0) {
        setError("⚠️ Location not found. Please enter a valid address in Manila.");
        setLocation("");
        return;
      }

      const { lat, lon, display_name } = data[0];

      if (isInsideManila(parseFloat(lat), parseFloat(lon))) {
        setError("");
        setLocation(display_name);
      } else {
        setError("The address you entered is outside Manila.");
        setLocation("");
      }
    } catch (err) {
      console.error(err);
      setError("Error validating location. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      showError("Please enter a valid location within Manila.", "Invalid Location");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("price", price);

      if (frontdisplay) formData.append("frontdisplay", frontdisplay, frontdisplay.name);
      if (room) formData.append("room", room, room.name);
      others.forEach((file) => formData.append("others", file, file.name));

      await axios.post("http://localhost:4000/CreateHotels", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Property added successfully!", "Success");
      setName("");
      setDescription("");
      setLocation("");
      setPrice("");
      setFrontdisplay(null);
      setRoom(null);
      setOthers([]);
      setError("");

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error adding hotel:", err);
      showError("Failed to add property. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setOthers((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setOthers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Name *
        </label>
        <input
          type="text"
          placeholder="Enter property name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input w-full"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price per Night (₱) *
        </label>
        <input
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="form-input w-full"
        />
      </div>

      {/* Location Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location (Manila only) *
        </label>
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onBlur={validateLocation}
          required
          className="form-input w-full"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          placeholder="Describe your property..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="form-input w-full resize-none"
        />
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Front Display Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFrontdisplay(e.target.files[0])}
            className="form-input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRoom(e.target.files[0])}
            className="form-input w-full"
          />
        </div>
      </div>

      {/* Additional Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Images
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="form-input w-full"
        />
        {others.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {others.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="reset"
          className="nav-button"
          onClick={() => {
            setName("");
            setDescription("");
            setLocation("");
            setPrice("");
            setFrontdisplay(null);
            setRoom(null);
            setOthers([]);
          }}
        >
          Reset
        </button>
        <button type="submit" disabled={loading} className="form-button">
          {loading ? "Adding Property..." : "➕ Add Property"}
        </button>
      </div>
    </form>
  );
};

export default AddHotels;
