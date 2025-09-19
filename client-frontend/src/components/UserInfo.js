import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const UserInfo = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="p-4 bg-gray-100 rounded text-center">
      <h2 className="text-xl font-bold">Welcome, {user?.displayName || user?.username}</h2>
      <p><strong>ID:</strong> {user?.id}</p>
      <button className="mt-4 w-full bg-red-600 text-white py-2 rounded" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default UserInfo;
