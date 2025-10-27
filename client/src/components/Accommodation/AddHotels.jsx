import React, { useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { showSuccess, showError } from "../../utils/modalUtils";

const AddHotels = ({ onSuccess }) => {
  const context = useOutletContext();
  const user = context?.user || null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [frontdisplay, setFrontdisplay] = useState(null);
  const [room, setRoom] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("price", price);

      // Append files only if they exist
      if (frontdisplay) formData.append("frontdisplay", frontdisplay, frontdisplay.name);
      if (room) formData.append("room", room, room.name);
      
      // Append multiple additional images
      others.forEach((file) => {
        formData.append("others", file, file.name);
      });

      const response = await axios.post(
        "http://localhost:4000/CreateHotels",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Hotel added:", response.data);
      showSuccess("Property added successfully!", "Success");

      // Reset form
      setName("");
      setDescription("");
      setLocation("");
      setPrice("");
      setFrontdisplay(null);
      setRoom(null);
      setOthers([]);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error adding hotel:", err);
      showError("Failed to add property. Please try again.", "Error");
    }

    setLoading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      setOthers(prev => [...prev, ...files]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setOthers(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setOthers(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <input
          type="text"
          placeholder="e.g., Taguig City, Philippines"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="form-input w-full"
        />
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Multiple Additional Images with Drag & Drop */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Images
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-4xl mb-3">📸</div>
          <p className="text-gray-600 mb-2">
            Drag and drop multiple images here
          </p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="additional-images"
          />
          <label
            htmlFor="additional-images"
            className="nav-button inline-block cursor-pointer"
          >
            📎 Browse Files
          </label>
        </div>

        {/* Display selected images */}
        {others.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Images ({others.length})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {others.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button 
          type="button" 
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
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="form-button"
        >
          {loading ? "Adding Property..." : "➕ Add Property"}
        </button>
      </div>
    </form>
  );
};

export default AddHotels;
