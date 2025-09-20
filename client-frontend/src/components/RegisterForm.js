import { useNavigate, Link } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      username: form.get("username"),
      email: form.get("email"),
      displayName: form.get("displayName"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      });
      const result = await res.json();

      if (res.ok) {
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        alert(result.error || "Registration failed");
      }
    } catch (err) {
      alert("Connection error: " + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input name="username" placeholder="Username" className="p-2 border w-full" required />
        <input name="email" placeholder="Email" className="p-2 border w-full" />
        <input name="displayName" placeholder="Display Name" className="p-2 border w-full" />
        <input type="password" name="password" placeholder="Password" className="p-2 border w-full" required />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Register</button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
