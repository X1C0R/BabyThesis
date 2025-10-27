import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabased/supabasedClient";
import Navbar from "../Navbar";

const UserLanding = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user session and role/approval from users table
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      if (!currentUser) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      // Fetch role and approval from users table
      const { data, error } = await supabase
        .from("users")
        .select("role, is_approved")
        .eq("id", currentUser.id)
        .single();

      if (!error && data) {
        setUser({ ...currentUser, ...data });
      } else {
        setUser(currentUser); // fallback if error
      }
      setLoadingUser(false);
    };

    fetchUserData();

    // Listen for auth changes
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

  const LogOut = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/");
    }
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
    <div className="min-h-screen bg-white">
      <Navbar user={user} onLogout={LogOut} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-blue-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
              Find Your Perfect
              <span className="block text-yellow-500 mt-2">Accommodation</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover amazing hotels, apartments, and dormitories for your next stay. 
              Book with confidence and enjoy the best accommodation experience.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4 focus-within:shadow-xl transition-shadow">
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400 text-lg"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                  🔍 Search
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Hotels Available</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-gray-900 mb-2">50+</div>
                <div className="text-gray-600 font-medium">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-gray-900 mb-2">10K+</div>
                <div className="text-gray-600 font-medium">Happy Guests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5">
              Why Choose AccommodationHub?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide the best accommodation booking experience with trusted partners and excellent service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:border-blue-400">
              <div className="text-6xl mb-6">🏨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Hotels</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay in luxury hotels with world-class amenities and exceptional service.
              </p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:border-purple-400">
              <div className="text-6xl mb-6">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Modern Apartments</h3>
              <p className="text-gray-600 leading-relaxed">
                Comfortable apartments perfect for extended stays and family trips.
              </p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:border-green-400">
              <div className="text-6xl mb-6">🏫</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Student Dormitories</h3>
              <p className="text-gray-600 leading-relaxed">
                Affordable dormitory options for students and budget-conscious travelers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied guests who have found their ideal accommodation with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <button 
                  className="nav-button primary text-lg px-8 py-4"
                  onClick={() => navigate("/register")}
                >
                  🚀 Get Started
                </button>
                <button 
                  className="nav-button text-lg px-8 py-4"
                  onClick={() => navigate("/login")}
                >
                  🔐 Sign In
                </button>
              </>
            ) : (
              <button 
                className="nav-button primary text-lg px-8 py-4"
                onClick={() => navigate("/accommodation")}
              >
                🏠 Browse Accommodations
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AccommodationHub</h3>
              <p className="text-gray-400">
                Your trusted partner for finding the perfect accommodation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hotel Booking</li>
                <li>Apartment Rental</li>
                <li>Dormitory Services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AccommodationHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLanding;
