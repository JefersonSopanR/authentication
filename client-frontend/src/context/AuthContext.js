import React, { createContext, useState, useEffect } from "react";

//creates a data-sharing-system so any component can directly get acces to the data
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  // Check if token still valid
  //this useEffect only triggers when: App starts, Token changes.
  useEffect(() => {
	//define the function
    const checkAuth = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:3001/api/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
	//calling the function
    checkAuth();
  }, [token]);

  //the login and logout are here because they need acces to the user and token variables.
  const login = (token, user) => {
    localStorage.setItem("authToken", token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
