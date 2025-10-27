import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./db/supabaseClient.js";
import multer from "multer";

dotenv.config();
// const apiKey = process.env.GOOGLE_API_KEY;
const app = express();
app.use(cors());
app.use(express.json());

//storage for images
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "YourAppName/1.0" },
  });
  const data = await res.json();

  if (!data || data.length === 0) {
    console.warn("Nominatim returned no results for:", address);
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
      console.log('Received files:', JSON.stringify(req.files, null, 2));
      console.log('Received body:', req.body);

      const { user_id, name, description, location, price } = req.body;
      
      if (!req.files) {
        console.log("No files received in request");
      }

      if (!user_id || !name || !location || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let latitude = null,
        longitude = null;
      try {
        const coords = await TranslateLocation(location);
        latitude = coords.latitude;
        longitude = coords.longitude;
      } catch (err) {
        console.error("TranslateLocation failed:", err);
      }


      const UploadImg = async (file, folder) => {
        if (!file) return null;
        const fileExt = file.originalname.split(".").pop();
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
        console.log(`Upload successful for ${folder}:`, data.publicUrl);
        return data.publicUrl;
      };

      let FirstImage = null;
      if (req.files && req.files.frontdisplay && Array.isArray(req.files.frontdisplay) && req.files.frontdisplay.length > 0) {
        FirstImage = await UploadImg(req.files.frontdisplay[0], "frontdisplay");
      }

      let RoomImage = null;
      if (req.files && req.files.room && Array.isArray(req.files.room) && req.files.room.length > 0) {
        RoomImage = await UploadImg(req.files.room[0], "room");
      }

      // Handle multiple additional images
      let OtherImages = [];
      if (req.files && req.files.others && Array.isArray(req.files.others) && req.files.others.length > 0) {
        console.log(`Processing ${req.files.others.length} additional images`);
        for (const file of req.files.others) {
          const url = await UploadImg(file, "others");
          if (url) OtherImages.push(url);
        }
      } else {
        console.log("No additional images provided");
      }

      console.log("Frontdisplay file:", req.files?.frontdisplay?.[0]);
      console.log("Room file:", req.files?.room?.[0]);
      console.log("Others files count:", OtherImages.length);
      console.log("req.files structure:", JSON.stringify(Object.keys(req.files || {})));

      console.log("Inserting hotel with data:", {
        user_id,
        name,
        description,
        location,
        price,
        latitude,
        longitude,
        frontdisplay: FirstImage,
        room: RoomImage,
        others: OtherImages.length > 0 ? OtherImages.join(',') : null,
      });

      const { data, error } = await supabase
        .from("hotels")
        .insert([
          {
            user_id,
            name,
            description,
            location,
            price: parseFloat(price),
            latitude,
            longitude,
            frontdisplay: FirstImage,
            room: RoomImage,
            others: OtherImages.length > 0 ? OtherImages.join(',') : null,
          },
        ])
        .select(); // Return the inserted row

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Insert result:", JSON.stringify(data, null, 2));
      if (data && data.length > 0) {
        res.json({ message: "Hotel added successfully", hotel: data[0] });
      } else {
        // Still return success even if we can't get the row back
        console.warn("Hotel inserted but no data returned");
        res.json({ message: "Hotel added successfully (data not retrieved)" });
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

    res.json({ success: true, hotels: data });
  } catch (error) {
    console.error("GET HOTELS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all hotels
app.get("/hotels", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, hotels: data });
  } catch (error) {
    console.error("GET ALL HOTELS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
