import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import { supabase } from "../supabased/supabasedClient";

// 🧭 Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper to update map view dynamically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center]);
  return null;
}

const AddHotels = ({ onHotelAdded, onClose }) => {
  const { user, loadingUser } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [frontdisplay, setFrontdisplay] = useState(null);
  const [room, setRoom] = useState(null);
  const [others, setOthers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState([]);

  const [coords, setCoords] = useState({ lat: 14.5995, lng: 120.9842 });
  const [locationError, setLocationError] = useState("");

  if (loadingUser) return <p>Loading user session...</p>;
  if (!user) return <p>You must be logged in to add a hotel.</p>;

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!location.trim()) {
        setLocationError("");
        return;
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            location
          )}`
        );
        const data = await res.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
          setLocationError("");
        } else {
          setLocationError("⚠️ Location not found. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        setLocationError("⚠️ Unable to fetch location.");
      }
    };

    const delayDebounce = setTimeout(fetchCoordinates, 800);
    return () => clearTimeout(delayDebounce);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadImage = async (file, path) => {
        if (!file) return null;
        const { data, error } = await supabase.storage
          .from("hotels-images")
          .upload(path, file, { upsert: true });
        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("hotels-images")
          .getPublicUrl(path);
        return urlData.publicUrl;
      };

      const frontUrl = await uploadImage(
        frontdisplay,
        `front/${Date.now()}_${frontdisplay?.name}`
      );
      const roomUrl = await uploadImage(
        room,
        `room/${Date.now()}_${room?.name}`
      );
      const othersUrl = await uploadImage(
        others,
        `others/${Date.now()}_${others?.name}`
      );

      const { data, error } = await supabase
        .from("hotels")
        .insert([
          {
            user_id: user.id,
            name,
            description,
            location,
            price: parseFloat(price),
            available_dates: available,
            frontdisplay_url: frontUrl,
            room_url: roomUrl,
            others_url: othersUrl,
            latitude: coords.lat,
            longitude: coords.lng,
          },
        ])
        .select();

      if (error) throw error;

      alert("Hotel added successfully!");
      if (onHotelAdded) onHotelAdded(data[0]);

      // Reset form
      setName("");
      setDescription("");
      setLocation("");
      setPrice("");
      setFrontdisplay(null);
      setRoom(null);
      setOthers(null);
      setAvailable([]);
    } catch (err) {
      console.error("Error adding hotel:", err);
      alert(err.message || "Error adding hotel.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-row">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 self-center max-w-4/5 mx-auto border p-6 rounded-lg absolute inset-0 h-fit bg-white shadow-md"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-2 text-center">
          Add New Hotel
        </h2>

        <div className="flex flex-row w-full gap-10">
          <div className="flex flex-row h-85">
            <div className="border rounded-tl-2xl">
              <input
                id="frontdisplay"
                type="file"
                accept="image/*"
                onChange={(e) => setFrontdisplay(e.target.files[0])}
                className="custom-file-input h-full content-center"
              />
            </div>
            <div className="flex flex-col">
              <div className="border-l-0 border-t border-r border-b h-full">
                <input
                  id="room"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRoom(e.target.files[0])}
                  className="room-file-input h-full content-center"
                />
              </div>
              <div className="border-t-0 border-r border-b h-full">
                <input
                  id="others"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setOthers(e.target.files[0])}
                  className="Others-file-input w-full h-full content-center"
                />
              </div>
            </div>
          </div>

          <div className="h-85 rounded-tr-2xl border-black overflow-hidden w-full">
            <MapContainer
              center={coords}
              zoom={16}
              zoomControl={false}
              className="w-full h-85 rounded-tr-2xl border-black"
            >
              <ChangeView center={coords} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={coords}>
                <Popup>{location || "Default Location (Manila)"}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="flex flex-row gap-25 mt-4">
          <div className="flex flex-col gap-4 w-3/6 border">
            <div className="flex flex-row items-center gap-10 w-full">
              <p className="whitespace-nowrap">Accommodation name:</p>
              <input
                type="text"
                placeholder="Hotel Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-b p-2 outline-none w-3/6"
              />
            </div>

            <div className="flex flex-row items-center gap-35">
              <p>Location:</p>
              <input
                type="text"
                placeholder="Location (e.g., Taguig City, Philippines)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="border-b p-2 outline-none w-3/6"
              />
            </div>
            {locationError && (
              <p className="text-red-600 text-sm">{locationError}</p>
            )}

            <div className="flex flex-row items-center gap-24">
              <p>Price per night: </p>
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="border-b p-2 outline-none w-3/6"
              />
            </div>

            <div className="flex flex-col">
              <label>Details of the Room</label>
              <label className="text-sm text-gray-500">
                (e.g., 2-4 pax, 1 room, 2 bed, 1 bathroom)
              </label>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-b p-2 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 p-2 rounded text-white transition ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Adding..." : "Add Hotel"}
            </button>
          </div>

          {/* Calendar Section */}
          <div className="p-2 flex flex-row gap-1 w-3/6">
            <div className="flex flex-col p-2 border">
              <span>Selected Dates</span>
              {available.length > 0 ? (
                available.map((date) => (
                  <span key={date} className="mt-1">
                    {date}
                  </span>
                ))
              ) : (
                <span className="text-center mt-1">None</span>
              )}
              {available.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAvailable([])}
                  className="mt-1 p-1 text-xs w-fit bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Clear Dates
                </button>
              )}
            </div>
              <div className="">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  className=""
                  disablePast
                  value={null}
                  onChange={(day) => {
                    const formatted = day.format("YYYY-MM-DD");
                    setAvailable((prev) =>
                      prev.includes(formatted)
                        ? prev.filter((d) => d !== formatted)
                        : [...prev, formatted]
                    );
                  }}
                  sx={{
                    width: "100%",
                    border: "1px solid black"
                  }}
                />
              </LocalizationProvider>
              </div>

            </div>
        </div>
      </form>
    </div>
  );
};

export default AddHotels;
