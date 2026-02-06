import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Safety Check: Ensure Stripe and Elements have loaded
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null); // Clear any previous errors

    // 2. Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirect to your completion page on success
        return_url: `${window.location.origin}/completion`,
      },
    });

    // 3. Error Handling: This only runs if there's an error during confirmation
    // If successful, the user is redirected away to the return_url
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="min-h-[150px]">
        {" "}
        {/* Prevents layout shift while Stripe loads */}
        <PaymentElement id="payment-element" />
      </div>

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full py-3 px-6 rounded-lg font-bold text-white transition-all transform hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Processing...
          </div>
        ) : (
          "Enroll Now"
        )}
      </button>

      {/* Dynamic Error Message Display */}
      {message && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-4 text-center">
          {message}
        </div>
      )}
    </form>
  );
}
