import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./db/supabaseClient.js";
import multer from "multer";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { use } from "react";


dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;
const app = express();
app.use(cors());
app.use(express.json());

//storage for images
const storage = multer.memoryStorage();
const upload = multer({ storage });


const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  next();
};


//Register accounts
app.post(
  "/register",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { email, password, full_name, contact_number, gender, role } =
        req.body;

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) throw authError;
      const userId = authData.user.id;

      let profileImageUrl = null;
      let idImageUrl = null;

      if (role?.toUpperCase() === "LANDLORD") {
        console.log("Landlord detected — processing images...");

        if (!req.files?.profile_image || !req.files?.id_image) {
          return res.status(400).json({
            error:
              "Both Profile Image and ID Image are required for Landlords.",
          });
        }

        const profileFile = req.files.profile_image[0];
        const profilePath = `profiles/${userId}-${profileFile.originalname}`;
        const { error: profileUploadError } = await supabase.storage
          .from("user-images")
          .upload(profilePath, profileFile.buffer, {
            contentType: profileFile.mimetype,
          });

        if (profileUploadError) throw profileUploadError;

        const { data: profilePublic } = supabase.storage
          .from("user-images")
          .getPublicUrl(profilePath);
        profileImageUrl = profilePublic.publicUrl;

        const idFile = req.files.id_image[0];
        const idPath = `ids/${userId}-${idFile.originalname}`;
        const { error: idUploadError } = await supabase.storage
          .from("user-images")
          .upload(idPath, idFile.buffer, { contentType: idFile.mimetype });

        if (idUploadError) throw idUploadError;

        const { data: idPublic } = supabase.storage
          .from("user-images")
          .getPublicUrl(idPath);
        idImageUrl = idPublic.publicUrl;
      }

      const { error: insertError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          full_name,
          contact_number,
          gender,
          role,
          id_image_url: profileImageUrl,
          id_image: idImageUrl,
        },
      ]);

      if (insertError) throw insertError;

      console.log("User registered successfully:", email);
      res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      res
        .status(500)
        .json({ error: error.message || "Server error. Please try again." });
    }
  }
);

//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (findError || !existingUser) {
      return res.status(404).json({
        success: false,
        error: "Email not found",
      });
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      if (authError.message.includes("Invalid login credentials")) {
        return res
          .status(401)
          .json({ success: false, error: "Incorrect password" });
      }
      throw authError;
    }

    res.json({
      success: true,
      message: "Login successful!",
      user: existingUser,
      token: authData.session.access_token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Server error: " + error.message });
  }
});

app.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("users")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "Landlord approved successfully." });
  } catch (error) {
    console.error("APPROVAL ERROR:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

//accounts pending
app.get("/pending-landlords", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "Landlord")
      .eq("is_approved", false);

    if (error) throw error;

    res.json({ success: true, landlords: data });
  } catch (error) {
    console.error("FETCH PENDING ERROR:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});


const TranslateLocation = async (address) => {
  if (!address || typeof address !== "string") {
    console.warn("Invalid address input");
    return { latitude: null, longitude: null };
  }

  const normalizedAddress = address.trim().toLowerCase();
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normalizedAddress)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "BabyThesis" },
  });

  const data = await res.json();

  if (!data || data.length === 0) {
    console.warn("Nominatim returned no results for:", normalizedAddress);
    return { latitude: null, longitude: null };
  }

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
};


app.post(
  "/CreateHotels",
  upload.fields([
    { name: "frontdisplay", maxCount: 1 },
    { name: "room", maxCount: 1 },
    { name: "others", maxCount: 10 }, // Allow multiple images
  ]),
  async (req, res) => {
    try {
      const { user_id, name, description, location, price } = req.body;

      if (!user_id || !name || !location || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const coords = await TranslateLocation(location);
      if (!coords.latitude || !coords.longitude) {
        return res.status(400).json({
          error: "Location not found. Please enter a valid city or address.",
        });
      }

      const uploadFile = async (file, folder) => {
        if (!file) return null;
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
          .from("hotels-images")
          .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
          console.error(`Upload error for ${folder}:`, error);
          return null;
        }

        const { data } = supabase.storage
          .from("hotels-images")
          .getPublicUrl(filePath);
        return data.publicUrl;
      };

      const frontUrl = await uploadFile(req.files?.frontdisplay?.[0], "frontdisplay");
      const roomUrl = await uploadFile(req.files?.room?.[0], "room");

      // Handle multiple additional images
      let othersUrls = [];
      if (req.files?.others && Array.isArray(req.files.others) && req.files.others.length > 0) {
        for (const file of req.files.others) {
          const url = await uploadFile(file, "others");
          if (url) othersUrls.push(url);
        }
      }

      const { data, error } = await supabase
        .from("hotels")
        .insert([
          {
            user_id,
            name,
            description,
            location,
            price: parseFloat(price),
            latitude: coords.latitude,
            longitude: coords.longitude,
            frontdisplay: frontUrl,
            room: roomUrl,
            others: othersUrls.length > 0 ? othersUrls.join(',') : null,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        res.json({ message: "Hotel added successfully", hotel: data[0] });
      } else {
        res.json({ message: "Hotel added successfully" });
      }
    } catch (err) {
      console.error("AddHotels Route Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Get hotels for a specific user
app.get("/hotels/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;


app.get("/UserProfile/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user: data });
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

    res.json({ success: true, hotels: data });
  } catch (error) {
    console.error("GET HOTELS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all hotels
app.get("/hotels", async (req, res) => {
  try {
    const { data, error } = await supabase.from("hotels").select("*");

    if (error) {
      console.error("Supabase error:", error.message);
      throw error;
    }

    console.log("Fetched from Supabase:", data);
    res.status(200).json(data || []);
  } catch (err) {
    console.error("Error fetching hotels:", err.message);
    res.status(500).json({ error: err.message });
  }
});



app.get("/search", async (req,res) => {
  try {
    const { location } = req.query;

    if(!location) {
      return res.status(400).json({error: "location is required"});
    }

    const {data, error} = await supabase.from("hotels").select("*").ilike("location", `${location}%`); 

    if(error) throw error;

    res.status(200).json(data || []);
  } catch (err) {
      console.error("Error searching hotels:", err.message);
    res.status(500).json({ error: "Failed to search hotels" });
  }
})


app.get("/EditHotels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received request for hotel ID:", id);

    if (!id) {
      console.log("⚠️ Missing ID");
      return res.status(400).json({ error: "Hotel ID is required" });
    }

    // Detect if the ID is a UUID (Supabase often uses UUIDs)
    const isUUID = /^[0-9a-fA-F-]{36}$/.test(id);

    let query = supabase.from("hotels").select("*");

    if (isUUID) {
      query = query.eq("id", id);
    } else if (!isNaN(id)) {
      query = query.eq("id", Number(id)); // handle numeric ids too
    } else {
      return res.status(400).json({ error: "Invalid hotel ID format" });
    }

    const { data, error } = await query.single();

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(404).json({ error: "Hotel not found or Supabase error" });
    }

    if (!data) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected server error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


//get all reviews
app.get("/reviews/:hotel_id", async (req, res) => {
  try {
    const { hotel_id } = req.params;

    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, hotel_id, user_id, user_email, rating, comment, created_at")
      .eq("hotel_id", hotel_id)
      .order("created_at", { ascending: false });

    if (reviewsError) throw reviewsError;

    const userIds = [...new Set(reviews.map((r) => r.user_id))]; 

    const { data: userData, error: userError } = await supabase
      .from("users") 
      .select("id, email")
      .in("id", userIds);

    if (userError) throw userError;

    const reviewsWithEmail = reviews.map((review) => {
      const matchedUser = userData?.find((u) => u.id === review.user_id);
      return {
        ...review,
        user_email: review.user_email || matchedUser?.email || "Anonymous",
      };
    });

    res.status(200).json(reviewsWithEmail || []);
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


//edit hotels
app.put(
  "/EditHotels/:id",
  upload.fields([
    { name: "frontdisplay", maxCount: 1 },
    { name: "room", maxCount: 1 },
    { name: "others", maxCount: 10 },
  ]),
  async (req, res) => {
    const hotelId = req.params.id;
    const { name, description, price } = req.body;

    try {

      const { data: existingHotel, error: hotelError } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", hotelId)
        .single();

      if (hotelError || !existingHotel) {
        return res.status(404).json({ message: "Hotel not found." });
      }


      const updateData = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (price) updateData.price = price;


      const uploadFile = async (file, folder) => {
        const filename = `${folder}/${uuidv4()}-${file.originalname}`;
        const { data, error } = await supabase.storage
          .from("hotels-images")
          .upload(filename, file.buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.mimetype,
          });

        if (error) throw error;

        const { data: publicData } = supabase.storage
          .from("hotels-images")
          .getPublicUrl(filename);

        return publicData.publicUrl;
      };


      if (req.files?.frontdisplay?.[0]) {
        const url = await uploadFile(req.files.frontdisplay[0], "frontdisplay");
        updateData.frontdisplay = url;
      }

      if (req.files?.room?.[0]) {
        const url = await uploadFile(req.files.room[0], "room");
        updateData.room = url;
      }

      if (req.files?.others?.length > 0) {
        const urls = await Promise.all(
          req.files.others.map((file) => uploadFile(file, "others"))
        );
        updateData.others = urls;
      }

 
      const { data, error } = await supabase
        .from("hotels")
        .update(updateData)
        .eq("id", hotelId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ message: "Hotel updated successfully", hotel: data });
    } catch (error) {
      console.error("Error updating hotel:", error.message);
      res.status(500).json({
        message: "Failed to update hotel.",
        error: error.message,
      });
    }
  }
);

//ratings post
app.post("/reviews", async (req, res) => {
  try {
    const { hotel_id, rating, comment } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "User not logged in" });
    }


    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Token validation failed:", userError?.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data: userData, error: userTableError } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .single();

    if (userTableError) {
      console.warn("No matching user found in 'users' table:", userTableError.message);
    }


    const userEmail = userData?.email || user.email;


    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          hotel_id,
          user_id: user.id,
          user_email: userEmail, 
          rating: rating || null,
          comment: comment || null,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Review added successfully", data });
  } catch (error) {
    console.error("Server crash error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});







export default app;
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
