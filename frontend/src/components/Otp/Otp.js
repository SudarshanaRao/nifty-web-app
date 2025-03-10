import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./style.css";

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userId] = useState("556c3d52-e18d-11ef-9b7f-02fd6cfaf985");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Function to send OTP via API
  const sendOtp = async () => {
    try {
      const mobileNo = "7013302191";
      const response = await axios.put(`https://dev-api.nifty10.com/nif/user/sendOtp?mobileNo=${mobileNo}`);
  
      const receivedOtp = response.data.data?.otp; // Corrected path to extract OTP
      if (receivedOtp) {
        setGeneratedOtp(receivedOtp); // Store OTP for hint display
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  // Function to verify OTP via API
  const verifyOtp = async () => {
    try {
      const fullOtp = otp.join(""); // User-entered OTP
      const otpNumber = Number(fullOtp);
      
  
      if (otpNumber !== generatedOtp) {
        toast.error("Invalid OTP. Please try again.");
        
        return;
      }
  
      const url = `https://dev-api.nifty10.com/nif/user/verifyOtp?Otp=${fullOtp}&userId=${userId}`;
      await axios.put(url);
      
      toast.success("OTP Verified! Redirecting...");
      localStorage.setItem("isOtpVerfied", "true");
      setTimeout(() => navigate("/home"), 2000);
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    }
  };
  

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("userToken");
    if (!isAuthenticated) {
      toast.error("You need to login first!");
      navigate("/login");
      return;
    }
    sendOtp();
  }, [navigate]);

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

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-main-container">
      <ToastContainer position="top-center" />
      <div className="otp-container">
        <h2>OTP has been sent to your registered mobile</h2>
        <p>Enter OTP</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyOtp();
          }}
        >
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
              sendOtp();
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
