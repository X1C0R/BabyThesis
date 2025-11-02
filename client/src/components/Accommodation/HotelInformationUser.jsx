import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { supabase } from "../supabased/supabasedClient";
import { Star } from "lucide-react"; 


const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onRatingChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
          className={`transition-transform duration-150 ${
            !readOnly ? "hover:scale-110" : ""
          }`}
        >
          <Star
            size={28}
            className={`${
              star <= (hover || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const HotelInformationUser = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/EditHotels/${hotelId}`);
        setHotel(res.data);
      } catch (error) {
        console.error("Error fetching hotel:", error);
      }
    };
    fetchHotel();
  }, [hotelId]);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/reviews/${hotelId}`);
        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [hotelId]);


  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to leave a review.");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to submit a review.");
        return;
      }

      const token = session.access_token;

      await axios.post(
        "http://localhost:4000/reviews",
        {
          hotel_id: hotelId,
          rating: rating || null,
          comment: newReview,
          user_email: user.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewReview("");
      setRating(0);

      const res = await axios.get(`http://localhost:4000/reviews/${hotelId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  if (!hotel) return <p>Loading hotel info...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
      {hotel.frontdisplay ? (
        <img
          src={hotel.frontdisplay}
          alt={hotel.name}
          className="w-full h-48 object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-xl">
          No Image
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4 mt-4">{hotel.name}</h1>
      <p className="text-gray-600 mb-6">{hotel.description}</p>

      <h2 className="text-lg font-semibold mb-3">Reviews</h2>

      {reviews.length > 0 ? (
        reviews.map((r, index) => (
          <div key={index} className="border-b border-gray-100 py-3">
            <p className="font-semibold">{r.user_email || "Anonymous"}</p>
            <StarRating rating={r.rating || 0} readOnly />
            <p className="text-gray-700">{r.comment}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}

      <div className="mt-6">
        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review
              </label>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Write your review..."
                className="w-full border border-gray-300 rounded-lg p-3"
                rows={3}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-600 font-medium">
            Please log in to leave a review.
          </p>
        )}
      </div>
    </div>
  );
};

export default HotelInformationUser;
