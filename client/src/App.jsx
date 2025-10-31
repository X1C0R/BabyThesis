import { BrowserRouter as Router, Routes, Route, Outlet, useParams  } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./components/supabased/supabasedClient";
import Navbar from "./components/Navbar";
import Register from "./components/LoginFolder/Register";
import UserLanding from "./components/landingpages/UserLanding";
import Login from "./components/LoginFolder/login";
import Accommodation from "./components/Accommodation/Accommodation";
import AddPropertyPage from "./components/Accommodation/AddPropertyPage";
import PropertyDetailPage from "./components/Accommodation/PropertyDetailPage";
import AdminProvesAccounts from "./components/Admin/AdminProvesAccounts";
import { showConfirm } from "./utils/modalUtils";
import Hotels from "./components/Accommodation/Hotels";
import SearchHotels from "./components/Accommodation/SearchHotels";
import EditHotels from "./components/Accommodation/EditHotels";

// Layout component with global navbar
function Layout() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("role, is_approved")
          .eq("id", userId)
          .single();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
      return null;
    };

    const initializeUser = async () => {
      try {
        console.log("Initializing user...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setUser(null);
          setLoadingUser(false);
          return;
        }
        
        const currentUser = sessionData?.session?.user;
        if (!currentUser) {
          console.log("No current user");
          setUser(null);
          setLoadingUser(false);
          return;
        }

        console.log("Fetching user data for:", currentUser.id);
        const userData = await fetchUserData(currentUser.id);
        if (userData) {
          console.log("User data fetched:", userData);
          setUser({ ...currentUser, ...userData });
        } else {
          console.log("No user data found");
          setUser(currentUser);
        }
        setLoadingUser(false);
        setIsInitializing(false);
      } catch (err) {
        console.error("Error initializing user:", err);
        setUser(null);
        setLoadingUser(false);
        setIsInitializing(false);
      }
    };

    initializeUser();

    // Set up auth state listener after a short delay to avoid race conditions
    const listenerTimeout = setTimeout(() => {
      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // console.log("Auth state changed:", event);
          
          if (session?.user) {
            console.log("Setting user from auth state change");
            const userData = await fetchUserData(session.user.id);
            if (userData) {
              setUser({ ...session.user, ...userData });
            } else {
              setUser(session.user);
            }
          } else {
            setUser(null);
          }
        }
      );
      
      // Store the listener for cleanup
      window.supabaseListener = listener;
    }, 100);

    return () => {
      clearTimeout(listenerTimeout);
      if (window.supabaseListener?.subscription) {
        window.supabaseListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    showConfirm(
      "Are you sure you want to logout?",
      async () => {
        await supabase.auth.signOut();
        setUser(null);
      },
      null,
      "Confirm Logout"
    );
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <Outlet context={{ user }} />
    </div>
  );
}

const EditHotelsWrapper = () => {
  const { id } = useParams();
  return <EditHotels hotelId={id} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<UserLanding/>}/>
          <Route path="/accommodation" element={<Accommodation/>}/>
          <Route path="/add-property" element={<AddPropertyPage/>}/>
          <Route path="/property/:id" element={<PropertyDetailPage/>}/>
          <Route path="/AdminProvesAccounts" element={<AdminProvesAccounts/>}/>
          <Route path="/Hotels" element={<Hotels/>}/>
          <Route path="/Search" element={<SearchHotels/>}/>
          <Route path="/editHotels/:id" element={<EditHotels/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;