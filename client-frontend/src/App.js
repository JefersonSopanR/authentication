import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UserInfo from "./components/UserInfo";
import useOAuthCallback from "./hooks/useOauthcallback";
import { useContext } from "react";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="text-center p-4">Loading...</div>; // ← Show loading while checking auth
  }
  
  return user ? children : <Navigate to="/login" />; // ← Redirect to login, not register
}
//Use <Navigate> for automatic redirects (like now), use useNavigate for user-triggered navigation

function AppContent() {
  useOAuthCallback();

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserInfo />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
            <AppContent />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

/*
function Dashboard() {
  const navigate = useNavigate();
  
  const goToProfile = () => {
    navigate('/profile'); // ← Navigate when button clicked
  };
  
  const goBack = () => {
    navigate(-1); // ← Go back in history
  };
  
  return (
    <div>
      <button onClick={goToProfile}>View Profile</button>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
}
 */
