import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import api from "../../services/api";

// Initialize Stripe with your Publishable Key safely (prevent top-level crash if undefined)
const stripePromise = (() => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (key && key.startsWith('pk_')) {
    return loadStripe(key);
  }
  return null;
})();

export default function StripeContainer({ amount, courseId }) {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset error state on new request
    setError(null);

    // Ensure we only fetch if amount exists and Stripe is configured
    if (amount > 0 && stripePromise) {
      api.post("/create-payment-intent", { amount, courseId })
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch((err) => {
          console.error("Stripe Initialization Error:", err);
          setError("Could not initialize payment. Please try again later.");
        });
    }
  }, [amount, courseId]);

  // Dark mode UI configuration to match Stride homepage
  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#6366f1", // Purple-blue button color
      colorBackground: "#161b22", // Lighter dark for the card
      colorText: "#ffffff",
      colorDanger: "#df1b41",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "12px",
    },
    rules: {
      ".Input": {
        border: "1px solid #30363d",
      },
    },
  };

  if (!stripePromise) {
    return (
      <div className="text-red-400 p-4 bg-red-950/20 border border-red-500/20 rounded-lg text-sm text-center">
        Stripe publishable key is missing or invalid. Please check your configuration.
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-500/20 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {clientSecret ? (
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <CheckoutForm courseId={courseId} />
        </Elements>
      ) : (
        /* Loading Skeleton to match your dark theme */
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-800 rounded-lg w-full"></div>
          <div className="h-12 bg-gray-800 rounded-lg w-full"></div>
          <div className="h-12 bg-indigo-900/30 rounded-lg w-full"></div>
        </div>
      )}
    </div>
  );
}
