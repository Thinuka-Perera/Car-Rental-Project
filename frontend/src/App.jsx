import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import ContactPage from "./pages/ContactPage";
import CarPage from "./pages/CarPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import { FaArrowUp } from "react-icons/fa";
import MyBookings from "./components/MyBookings";
import VerifyPaymentPage from "./pages/VerifyPaymentPage";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authToken = localStorage.getItem("token");

  if (!authToken) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // If authenticated, allow access to the protected page
  return children;
};

// RedirectIfAuthenticated Route
const RedirectIfAuthenticated = ({ children }) => {
  const authToken = localStorage.getItem("authToken"); // make sure key matches ProtectedRoute
  if (authToken) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [showButton, setShowButton] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Show/hide scroll button on scroll
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cars" element={<CarPage />} />

        {/* Protected routes */}
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Auth-only routes */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated>
              <SignUp />
            </RedirectIfAuthenticated>
          }
        />

        <Route path="/success" element={<VerifyPaymentPage/>}></Route>
        <Route path="/cancel" element={<VerifyPaymentPage/>}></Route>

        <Route path="*" element={<Navigate to="/" replace />} />  

      </Routes>

      {/* Scroll to Top Button */}
      {showButton && (
        <button
          onClick={scrollUp}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default App;
