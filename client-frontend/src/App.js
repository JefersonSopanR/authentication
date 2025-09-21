import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UserInfo from "./components/UserInfo";
import useOAuthCallback from "./hooks/useOauthcallback";
import { useContext } from "react";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    console.log("Loading  on ProtectedRoute({ children })")
    return <div className="text-center p-4">Loading...</div>; // ← Show loading while checking auth
  }
  
  return user ? children : <Navigate to="/login" />; // ← Redirect to login, not register
}
//Use <Navigate> for automatic redirects (like now), use useNavigate for user-triggered navigation

const Game = () => {
  return (
    <div>
      <h1>Game</h1>
    </div>
  )
}

const Settings = () => {
  return (
    <div>
      <h1>settingss</h1>
    </div>
  )
}

function AppContent() {
  useOAuthCallback();

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      {/* Adding this to allow nested routes */}
      <Route
        path="/profile/*"
        element={
          <ProtectedRoute>
            <ProfileLayout/>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function ProfileLayout() {
  return (
    <div>
      <h1>Profile Senction</h1>

      {/** Navigation Menu */}
      <nav className="mb-4">
        <Link to="/profile" >Profile</Link>
        <Link to="/profile/game" >Game</Link>
        <Link to="/profile/settings" >Settings</Link>
      </nav>

      {/* Nested Routes protected */}
      <Routes>
        <Route index element={ <UserInfo/> }/>
        <Route path="game"  element={<Game/>} />
        <Route path="settings" element={<Settings/>} />
      </Routes>
    </div>
  )
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
