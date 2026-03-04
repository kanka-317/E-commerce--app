import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/Shopcontext";

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { backendUrl, token, getUserCart } = useContext(ShopContext);
  const [message, setMessage] = useState("Verifying Stripe payment...");
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verifyPayment = async () => {
      const success = searchParams.get("success");
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setMessage("Invalid payment session.");
        toast.error("Invalid Stripe session.");
        navigate("/orders");
        return;
      }

      if (!token) {
        setMessage("Please login again to verify payment.");
        toast.error("Login required to verify payment.");
        navigate("/login");
        return;
      }

      if (!backendUrl) {
        setMessage("Backend URL missing.");
        toast.error("Set VITE_BACKEND_URL in frontend .env");
        navigate("/orders");
        return;
      }

      try {
        const response = await axios.post(
          `${backendUrl}/api/order/verifyStripe`,
          {
            success: success === "true",
            sessionId,
          },
          {
            headers: {
              token,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          setMessage("Payment verified successfully.");
          toast.success("Payment successful.", { toastId: "stripe-payment-success" });
          await getUserCart();
          navigate("/orders", { replace: true });
        } else {
          setMessage(response.data?.message || "Payment not completed.");
          toast.error(response.data?.message || "Payment not completed.", {
            toastId: "stripe-payment-failed",
          });
          await getUserCart();
          navigate("/cart", { replace: true });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Unable to verify payment.";
        setMessage(errorMessage);
        toast.error(errorMessage, { toastId: "stripe-payment-error" });
        navigate("/orders", { replace: true });
      }
    };

    verifyPayment();
  }, [backendUrl, getUserCart, navigate, searchParams, token]);

  return (
    <div className="min-h-[60vh] border-t flex items-center justify-center text-sm text-gray-600">
      {message}
    </div>
  );
};

export default Verify;
