import "./App.css";
import Login from "./components/Login/Login";
import Otp from "./components/Otp/Otp";
import HomePage from "./components/HomePage/HomePage";
import { Route, Routes, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Protected Route Component
function ProtectedRoute({ children, requireOtp = false }) {
  const isAuthenticated = useMemo(() => localStorage.getItem("userToken"), []);
  const isOtpVerified = useMemo(() => localStorage.getItem("otpVerified"), []);

  if (!isAuthenticated) {
    toast.error("You need to login first!", { position: "top-center" });
    return <Navigate to="/login" replace />;
  }

  if (requireOtp && !isOtpVerified) {
    toast.error("You need to verify OTP first!", { position: "top-center" });
    return <Navigate to="/otp" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<ProtectedRoute><Otp /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute requireOtp={true}><HomePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} /> {/* Redirect unknown routes */}
      </Routes>
    </>
  );
}

export default App;
