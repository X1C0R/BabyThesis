import React, { useEffect, useState } from "react";
import axios from "axios";
import { showSuccess, showError } from "../../utils/modalUtils";
import { useParams, useNavigate } from "react-router-dom";

const EditHotels = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [frontdisplay, setFrontdisplay] = useState(null);
  const [room, setRoom] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(false);

  // FETCH HOTEL DATA FROM BACKEND
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/EditHotels/${id}`);
        const data = res.data;

        setHotel(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(data.price || "");
      } catch (err) {
        console.error("Error fetching hotel:", err.response?.data || err.message);
        showError("Failed to fetch hotel data.", "Error");
      }
    };

    if (id) fetchHotel();
  }, [id]);

  // 🟢 HANDLE UPDATE SUBMIT
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);

      if (frontdisplay) formData.append("frontdisplay", frontdisplay);
      if (room) formData.append("room", room);
      others.forEach((file) => formData.append("others", file));

      const response = await axios.put(
        `http://localhost:4000/EditHotels/${id}`, 
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showSuccess("Hotel updated successfully!", "Success");
      console.log("Updated Hotel:", response.data);

  
      setTimeout(() => navigate("/accommodation"), 1500);
    } catch (err) {
      console.error("Error updating hotel:", err.response?.data || err.message);
      showError("Failed to update hotel. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  if (!hotel)
    return <p className="text-center text-gray-500 mt-8">Loading hotel data...</p>;

  return (
    <form
      onSubmit={handleUpdate}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">✏️ Edit Hotel</h2>

      {/* Name + Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Night (₱)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-input w-full"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input w-full resize-none"
        ></textarea>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {hotel.frontdisplay && (
          <div>
            <p className="text-sm text-gray-700 mb-2">Current Front Display:</p>
            <img
              src={hotel.frontdisplay}
              alt="Front Display"
              className="rounded-lg w-full h-40 object-cover border"
            />
          </div>
        )}
        {hotel.room && (
          <div>
            <p className="text-sm text-gray-700 mb-2">Current Room Image:</p>
            <img
              src={hotel.room}
              alt="Room"
              className="rounded-lg w-full h-40 object-cover border"
            />
          </div>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Front Display
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFrontdisplay(e.target.files[0])}
            className="form-input w-full"
          />
          {frontdisplay && (
            <img
              src={URL.createObjectURL(frontdisplay)}
              alt="New Front"
              className="w-full h-32 mt-2 rounded-lg object-cover"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Room Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRoom(e.target.files[0])}
            className="form-input w-full"
          />
          {room && (
            <img
              src={URL.createObjectURL(room)}
              alt="New Room"
              className="w-full h-32 mt-2 rounded-lg object-cover"
            />
          )}
        </div>
      </div>

      {/* Additional Images */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Additional Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setOthers(Array.from(e.target.files))}
          className="form-input w-full"
        />
        {others.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {others.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Other ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}
      </div>


      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="nav-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="form-button"
        >
          {loading ? "Updating..." : "💾 Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditHotels;
