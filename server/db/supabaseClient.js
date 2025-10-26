import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const supabase = createClient(
  "https://twtyxtiaaiirwzbixjiw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dHl4dGlhYWlpcnd6Yml4aml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIxODI5NSwiZXhwIjoyMDc2Nzk0Mjk1fQ.oLxK1bSpYzIwr-hkHVD7R9sYeSCXc8oVuxSyxh8_ra4",
   {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
