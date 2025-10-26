import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthProvider";

const AddHotels = () => {
  const { user, loadingUser } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [frontdisplay, setFrontdisplay] = useState(null);
  const [room, setRoom] = useState(null);
  const [others, setOthers] = useState(null);
  const [loading, setLoading] = useState(false);

  if (loadingUser) return <p>Loading user session...</p>;
  if (!user) return <p>You must be logged in to add a hotel.</p>;

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
      if (others) formData.append("others", others, others.name);

      const response = await axios.post(
        "http://localhost:4000/CreateHotels",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Hotel added:", response.data);
      alert("Hotel added successfully!");

      // Reset form
      setName("");
      setDescription("");
      setLocation("");
      setPrice("");
      setFrontdisplay(null);
      setRoom(null);
      setOthers(null);
    } catch (err) {
      console.error("Error adding hotel:", err);
      alert("Error adding hotel. Check console for details and make sure the backend is running.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-md mx-auto border p-4 rounded"
    >
      <input
        type="text"
        placeholder="Hotel Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location (e.g., Taguig City, Philippines)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <label>Front Display Image:</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFrontdisplay(e.target.files[0])}
      />

      <label>Room Image:</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setRoom(e.target.files[0])}
      />

      <label>Other Images:</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setOthers(e.target.files[0])}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Hotel"}
      </button>
    </form>
  );
};

export default AddHotels;
