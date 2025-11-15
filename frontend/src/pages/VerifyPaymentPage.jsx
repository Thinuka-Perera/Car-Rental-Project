import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const VerifyPaymentPage = () => {
  const [statusMsg, setStatusMsg] = useState("Verifying your payment...");
  const [isSuccess, setIsSuccess] = useState(null); // null = loading, true = success, false = error
  const location = useLocation();
  const navigate = useNavigate();
  const search = location.search;

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const params = new URLSearchParams(search);
      const rawSession = params.get("session_id");
      const session_id = rawSession ? rawSession.trim() : null;
      const payment_status = params.get("payment_status");

      // Handle cancelled payment
      if (payment_status === "cancel") {
        setIsSuccess(false);
        setStatusMsg("Payment was cancelled. Redirecting...");
        setTimeout(() => navigate("/", { replace: true }), 2000);
        return;
      }

      // Validate session_id
      if (!session_id) {
        setIsSuccess(false);
        setStatusMsg("Invalid payment session. No session ID provided.");
        setTimeout(() => navigate("/", { replace: true }), 3000);
        return;
      }

      try {
        setStatusMsg("Confirming payment with server...");

        // ✅ FIXED: Use correct endpoint /confirm instead of /verify
        const res = await axios.get(
          `http://localhost:5000/api/payments/confirm?session_id=${session_id}`
        );

        if (cancelled) return;

        if (res?.data?.success) {
          setIsSuccess(true);
          setStatusMsg("Payment verified successfully! Redirecting to your bookings...");
          
          // ✅ FIXED: Navigate to /bookings (which shows MyBookings component)
          setTimeout(() => {
            navigate("/bookings", { replace: true });
          }, 2000);
        } else {
          setIsSuccess(false);
          setStatusMsg(res?.data?.message || "Payment verification failed.");
          setTimeout(() => navigate("/", { replace: true }), 3000);
        }
      } catch (err) {
        if (cancelled) return;
        
        console.error("❌ Verification failed:", err);
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;

        setIsSuccess(false);

        if (status === 404) {
          setStatusMsg(serverMsg || "Payment session not found.");
        } else if (status === 400) {
          setStatusMsg(serverMsg || "Payment was not completed.");
        } else if (status === 401) {
          setStatusMsg("Authentication required. Please log in.");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        } else {
          setStatusMsg(serverMsg || "There was an error verifying your payment.");
        }

        // Redirect to home after error
        setTimeout(() => navigate("/", { replace: true }), 4000);
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center max-w-lg bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {isSuccess === null && (
            <Loader className="w-16 h-16 text-orange-400 animate-spin" />
          )}
          {isSuccess === true && (
            <CheckCircle className="w-16 h-16 text-green-400 animate-pulse" />
          )}
          {isSuccess === false && (
            <XCircle className="w-16 h-16 text-red-400" />
          )}
        </div>

        {/* Status Message */}
        <h2 className="text-2xl font-bold mb-4">
          {isSuccess === null && "Verifying Payment"}
          {isSuccess === true && "Payment Successful!"}
          {isSuccess === false && "Payment Failed"}
        </h2>
        
        <p className="text-lg text-gray-300 mb-4">{statusMsg}</p>

        {/* Additional Info */}
        {isSuccess === false && (
          <p className="text-sm text-gray-400 mt-4">
            If you believe this is an error, please contact support with your session ID.
          </p>
        )}

        {/* Loading indicator */}
        {isSuccess === null && (
          <div className="mt-6 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPaymentPage;