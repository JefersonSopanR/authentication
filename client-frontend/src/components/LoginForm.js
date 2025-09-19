import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const LoginForm = () => {
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const loginData = {
      username: form.get("username"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(loginData),
      });
      const result = await res.json();

      if (res.ok) {
        login(result.token, result.user);
      } else {
        alert(result.error || "Login failed");
      }
    } catch (err) {
      alert("Connection error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input name="username" placeholder="Username" className="p-2 border w-full" required />
      <input type="password" name="password" placeholder="Password" className="p-2 border w-full" required />
      <button className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
    </form>
  );
};

export default LoginForm;
