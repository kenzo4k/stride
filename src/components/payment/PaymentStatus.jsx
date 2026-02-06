import React, { useState, useEffect } from "react";
import { useStripe } from "@stripe/react-stripe-js";

const PaymentStatus = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!stripe) return;

    // Grab the client secret from the URL
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded! Welcome to Stride.");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  return (
    <div className="text-center p-10 bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-4">Payment Status</h2>
      <p className="text-gray-400">{message || "Checking status..."}</p>
      {message && (
        <a
          href="/courses"
          className="mt-6 inline-block px-6 py-2 rounded-full font-semibold text-white"
          style={{
            background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
          }}
        >
          Go to My Courses
        </a>
      )}
    </div>
  );
};

export default PaymentStatus;
