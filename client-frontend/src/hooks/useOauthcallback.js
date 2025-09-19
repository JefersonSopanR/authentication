import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useOAuthCallback() {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      window.location.hash = "";
      // Immediately check user
      fetch("http://localhost:3001/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => login(token, data.user));
    }
  }, [login]);
}
