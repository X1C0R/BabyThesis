import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./components/supabased/supabasedClient";
import Navbar from "./components/Navbar";
import Register from "./components/LoginFolder/Register";
import UserLanding from "./components/landingpages/UserLanding";
import Login from "./components/LoginFolder/login";
import Accommodation from "./components/Accommodation/Accommodation";
import AdminProvesAccounts from "./components/Admin/AdminProvesAccounts";
import UserProfile from "./components/landingpages/UserProfile";

// Layout component with global navbar
function Layout() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      if (!currentUser) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role, is_approved")
        .eq("id", currentUser.id)
        .single();

      if (!error && data) {
        setUser({ ...currentUser, ...data });
      } else {
        setUser(currentUser);
      }
      setLoadingUser(false);
    };

    fetchUserData();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(prev => ({ ...prev, ...session.user }));
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<UserLanding/>}/>
          <Route path="/accommodation" element={<Accommodation/>}/>
          <Route path="/AdminProvesAccounts" element={<AdminProvesAccounts/>}/>
          <Route path="/profile" element={<UserProfile/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;