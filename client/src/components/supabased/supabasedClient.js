import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://twtyxtiaaiirwzbixjiw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dHl4dGlhYWlpcnd6Yml4aml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTgyOTUsImV4cCI6MjA3Njc5NDI5NX0.-FI16DAYzyR1NTBhiZRvXTcHWbwI26LsN6sNSHvjZEM",
   {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);  
