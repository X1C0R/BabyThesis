import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./db/supabaseClient.js";
import multer from "multer";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;
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
    { name: "others", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { user_id, name, description, location, price, availableDates } =
        req.body;

      if (!user_id || !name || !location || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }


      const getDates = availableDates ? JSON.parse(availableDates) : [];


      const coords = await TranslateLocation(location);
      if (!coords.latitude || !coords.longitude) {
        return res.status(400).json({
          error:
            "Location not found. Please enter a valid city or address.",
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

        const { data: urlData } = supabase.storage
          .from("hotels-images")
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      };

      const frontUrl = await uploadFile(req.files?.frontdisplay?.[0], "front");
      const roomUrl = await uploadFile(req.files?.room?.[0], "room");
      const othersUrl = await uploadFile(req.files?.others?.[0], "others");


      const { data, error } = await supabase
        .from("hotels")
        .insert([
          {
            user_id,
            name,
            description,
            location,
            price: parseFloat(price),
            available_dates: getDates,
            latitude: coords.latitude,
            longitude: coords.longitude,
            frontdisplay_url: frontUrl,
            room_url: roomUrl,
            others_url: othersUrl,
          },
        ])
        .select();

      if (error) throw error;

      res.json({ message: "Hotel added successfully", hotel: data[0] });
    } catch (err) {
      console.error("AddHotels Route Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);




export default app;
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
