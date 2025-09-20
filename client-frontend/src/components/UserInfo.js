import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserInfo = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
      <p><strong>Username:</strong> {user?.username}</p>
      <p><strong>Display Name:</strong> {user?.displayName || user?.username}</p>
      <p><strong>User ID:</strong> {user?.id}</p>
      <button className="mt-6 w-full bg-red-600 text-white py-2 rounded" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserInfo;
