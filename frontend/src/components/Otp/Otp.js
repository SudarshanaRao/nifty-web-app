import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Function to generate a 6-digit OTP
  const generateOtp = () => {
    let randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    localStorage.setItem("generatedOtp", randomOtp); // Store OTP for verification
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("userToken"); // Check if user is logged in
    if (isAuthenticated == "null") {
      toast.error("You need to login first!", { position: "top-center", autoClose: 2000 });
      navigate("/login");
      return;
    }
    generateOtp();
  }, [navigate]);

  // Handle OTP input change
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Verify OTP on form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    const storedOtp = localStorage.getItem("generatedOtp"); // Retrieve stored OTP

    if (fullOtp === storedOtp) {
      localStorage.setItem("isOtpVerfied", "true"); // Mark OTP as verified
      toast.success("OTP Verified! Redirecting...", { autoClose: 2000 });
      setTimeout(() => navigate("/home"), 2000);
    } else {
      toast.error("Invalid OTP. Please try again.", { autoClose: 2000 });

    }
  };

  return (
    <div className="otp-main-container">
      <ToastContainer position="top-center" />
      <div className="otp-container">
        <h2>OTP has been sent to your registered mobile</h2>
        <p>Enter OTP</p>
        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>
          <p className="otp-hint">Hint OTP: {generatedOtp}</p>
          <button type="submit">Verify OTP</button>
        </form>
        <p className="resend">
          Haven't received the OTP?{" "}
          <a
            href="/otp"
            onClick={(e) => {
              e.preventDefault();
              generateOtp();
              setOtp(["", "", "", "", "", ""]);
              inputRefs.current[0]?.focus();
            }}
          >
            RESEND
          </a>
        </p>
      </div>
    </div>
  );
};

export default Otp;
