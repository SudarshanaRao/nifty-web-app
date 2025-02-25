import React, { useState, useEffect, useRef } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Function to generate OTP
  const generateOtp = () => {
    let randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
  };

  // Generate OTP when the page loads
  useEffect(() => {
    generateOtp();
  }, []);

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

  // Handle OTP verification
  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp === generatedOtp) {
      console.log("Successfully verified! Entered OTP:", fullOtp);
      navigate("/home");
    } else {
      console.log("Verification failed!");
    }
  };

  return (
    <div className="otp-main-container">
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
          {/* Show the generated OTP as a hint */}
          <p className="otp-hint">Hint OTP: {generatedOtp}</p>
          <button type="submit">Verify OTP</button>
        </form>
        {/* Resend OTP - Clicking it generates a new OTP */}
        <p className="resend">
          Haven't received the OTP?{" "}
          <a
            href="/login"
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
