
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabased/supabasedClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {

    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData.session?.user ?? null);
      setLoadingUser(false);
    };
    fetchUser();


    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
