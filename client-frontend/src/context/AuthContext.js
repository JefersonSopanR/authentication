import { createContext, useState, useEffect } from "react";

//creates a data-sharing-system so any component can directly get acces to the data
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [loading, setLoading] = useState(true); // ← Add loading state
  const [count, setCount] = useState(0);

  console.log("token is ::: -> '" + token + "'")
  console.log("user is ::: -> '" + user + "'")
  console.log("loading is ::: -> '" + loading + "'")
  console.log("count is ::: -> '" + count + "'")




  useEffect(() => {
    setCount(c => c + 1);
    const checkAuth = async () => {
      if (!token) {
        console.log("🚨 No token found, clearing user");
        setUser(null);
        setLoading(false); // ← Done loading
        return;
      }
      
      try {
        const res = await fetch("http://localhost:3001/api/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("✅ Token valid, setting user:", data.user);
          setUser(data.user);
        } else {
          localStorage.removeItem("authToken");
          console.log("Entering else AuthProvider!!!");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false); // ← Always done loading
      }
    };
    
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
    <AuthContext.Provider value={{ user, token, login, logout, loading }}> {/* ← Provide loading */}
      {children}
    </AuthContext.Provider>
  );
};
