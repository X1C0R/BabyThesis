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

      // console.log("Received registration:", email, role);

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) throw authError;
      const userId = authData.user.id;

      //Initialize image URLs
      let profileImageUrl = null;
      let idImageUrl = null;

      //Upload images ONLY if Landlord
      if (role?.toUpperCase() === "LANDLORD") {
        console.log("Landlord detected — processing images...");

        // Check if both files exist
        if (!req.files?.profile_image || !req.files?.id_image) {
          return res.status(400).json({
            error:
              "Both Profile Image and ID Image are required for Landlords.",
          });
        }

        // Upload profile image
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

        // Upload ID image
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

      // Insert into users table
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          full_name,
          contact_number,
          gender,
          role,
          id_image_url: profileImageUrl, // renamed for consistency in DB
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

    // Check if the email exists first
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

    //  Attempt login with Supabase Auth
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

    // Success — return user and token
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

    // Update landlord record
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
    { name: "others", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Debug: Log received files to inspect what's being sent
      console.log('Received files:', req.files);
      console.log('Received body:', req.body);

      const { user_id, name, description, location, price } = req.body;

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

        const { publicUrl } = supabase.storage
          .from("hotels-images")
          .getPublicUrl(filePath);
        return publicUrl;
      };

      let FirstImage = null;
      if (req.files && req.files.frontdisplay && Array.isArray(req.files.frontdisplay) && req.files.frontdisplay.length > 0) {
        FirstImage = await UploadImg(req.files.frontdisplay[0], "frontdisplay");
      }

      let RoomImage = null;
      if (req.files && req.files.room && Array.isArray(req.files.room) && req.files.room.length > 0) {
        RoomImage = await UploadImg(req.files.room[0], "room");
      }

      let OtherImage = null;
      if (req.files && req.files.others && Array.isArray(req.files.others) && req.files.others.length > 0) {
        OtherImage = await UploadImg(req.files.others[0], "others");
      }

      // Debug logs (unchanged, but now safer)
      console.log("Frontdisplay file:", req.files?.frontdisplay?.[0]);
      console.log("Room file:", req.files?.room?.[0]);
      console.log("Others file:", req.files?.others?.[0]);

      // Insert hotel data into Supabase (unchanged)
      const { data, error } = await supabase.from("hotels").insert([
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
          others: OtherImage,
        },
      ]);

      if (error) throw error;

      res.json({ message: "Hotel added successfully", hotel: data[0] });
    } catch (err) {
      console.error("AddHotels Route Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Export or start the app as needed




export default app;
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
