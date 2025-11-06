import React, { useEffect, useState } from "react";
import { signupStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCheck,
} from "react-icons/fa";
import logo from "../assets/logocar.png";
import { toast , ToastContainer} from "react-toastify";
import { FaUser } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // ✅ UI and behavior states
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error("Please Accept terms & conditions", { theme: "dark" });
    }

    toast.success("Account created successfully! Welcome to PremiumDrive", {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
      onClose: () => navigate("/login"),
    });
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className={signupStyles.pageContainer}>
      {/* Animated Background */}
      <div className={signupStyles.animatedBackground.base}>
        <div
          className={`${signupStyles.animatedBackground.orb1} ${
            isActive
              ? "translate-x-10 sm:translate-x-20 translate-y-5 sm:translate-y-10"
              : ""
          }`}
        ></div>
        <div
          className={`${signupStyles.animatedBackground.orb2} ${
            isActive
              ? "-translate-x-10 sm:-translate-x-20 -translate-y-5 sm:-translate-y-10"
              : ""
          }`}
        ></div>
        <div
          className={`${signupStyles.animatedBackground.orb3} ${
            isActive
              ? "-translate-x-5 sm:-translate-x-10 translate-y-10 sm:translate-y-20"
              : ""
          }`}
        ></div>
      </div>

      <a href="/" className={signupStyles.backButton}>
        <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-xs sm:text-sm">Back to Home</span>
      </a>

      <div
        className={`${signupStyles.signupCard.container} ${
          isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <div
          className={signupStyles.signupCard.card}
          style={{
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            borderRadius: "24px",
          }}
        >
          {/* Decorations */}
          <div className={signupStyles.signupCard.decor1} />
          <div className={signupStyles.signupCard.decor2} />

          {/* Header Section */}
          <div className={signupStyles.signupCard.headerContainer}>
            <div className={signupStyles.signupCard.logoContainer}>
              <div className={signupStyles.signupCard.logoText}>
                <img
                  src={logo}
                  alt="logo"
                  className="h-[1.2em] w-auto block object-contain"
                  style={{
                    display: "block",
                  }}
                />
                <span className="font-bold tracking-wider text-white mt-1">
                  YOUgo
                </span>
              </div>
            </div>
            <h1 className={signupStyles.signupCard.title}>Join PremiumDrive</h1>
            <p className={signupStyles.signupCard.subtitle}>
              Create your exclusive account
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className={signupStyles.form.container}>
            <div className={signupStyles.form.inputContainer}>
              <div className={signupStyles.form.inputWrapper}>
                <div className={signupStyles.form.inputIcon}>
                  <FaUser className="text-sm sm:text-base" />
                </div>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={signupStyles.form.input}
                  placeholder="Full Name"
                  required
                  style={{ borderRadius: "16px" }}
                />
              </div>
            </div>

            <div className={signupStyles.form.inputContainer}>
              <div className={signupStyles.form.inputWrapper}>
                <div className={signupStyles.form.inputIcon}>
                  <FaEnvelope className="text-sm sm:text-base" />
                </div>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={signupStyles.form.input}
                  placeholder="Your Email"
                  required
                  style={{ borderRadius: "16px" }}
                />
              </div>
            </div>

            <div className={signupStyles.form.inputContainer}>
              <div className={signupStyles.form.inputWrapper}>
                <div className={signupStyles.form.inputIcon}>
                  <FaLock className="text-sm sm:text-base" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={signupStyles.form.input}
                  placeholder="Create Password"
                  required
                  style={{ borderRadius: "16px" }}
                />
                <div
                  onClick={togglePasswordVisibility}
                  className={signupStyles.form.passwordToggle}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </div>
              </div>
            </div>

            {/* TNC */}
            <div className="flex items-start mt-2 sm:mt-3 md:mt-4">
              <div className="flex items-center h-5 mt-0.5 sm:mt-1">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                  className={signupStyles.form.checkbox}
                  style={{ boxShadow: "none" }}
                />
              </div>

              <div className="ml-2 sm:ml-3 text-xs sm:text-sm">
                <label
                  htmlFor="terms"
                  className={signupStyles.form.checkboxLabel}
                >
                  I agree to the{" "}
                  <span className={signupStyles.form.checkboxLink}>
                    Terms & Conditions
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={signupStyles.form.submitButton}
              style={{
                borderRadius: "16px",
                boxShadow: "0 5px 15px rgba(8,90,20,0.6)",
              }}
            >
              <span className={signupStyles.form.buttonText}>
                <FaCheck className="inline-block mr-2" />
                CREATE ACCOUNT
              </span>
              <div className={signupStyles.form.buttonHover} />
            </button>
          </form>
          <div
            className={signupStyles.signinSection}
            style={{
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <p className={signupStyles.signinText}>Already have an account?</p>

            <a
              href="/login"
              className={signupStyles.signinButton}
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(245, 124, 0, 0.08)",
              }}
            >
              LOGIN to your Account
            </a>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#fb923c",
          color: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(245,124,0,0.18)",
          fontFamily: "'Montserrat', sans-serif",
        }}
      />

      {/* Font Import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Montserrat', sans-serif; }
        `}
      </style>
    </div>
  );
};

export default Signup;
