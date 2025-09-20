import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
        navigate("/profile");
      } else {
        alert(result.error || "Login failed");
      }
    } catch (err) {
      alert("Connection error: " + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input name="username" placeholder="Username" className="p-2 border w-full" required />
        <input type="password" name="password" placeholder="Password" className="p-2 border w-full" required />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={() => (window.location.href = "http://localhost:3001/auth/google")}
          className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
      <p className="mt-4 text-center">
        Don’t have an account?{" "}
        <Link to="/register" className="text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
