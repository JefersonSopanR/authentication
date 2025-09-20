import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useOAuthCallback() {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("token");
    if (token) {
      window.location.hash = "";
      // Get user info and let login() handle localStorage and state
      fetch("http://localhost:3001/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // login() will handle localStorage.setItem() and state updates
          login(token, data.user);
        })
        .catch((err) => {
          console.error("OAuth callback failed:", err);
        });
    }
  }, []);// eslint-disable-line react-hooks/exhaustive-deps
// OAuth callback should only run once on mount, not when login function changes
 // Empty array: run only once on mount
}
