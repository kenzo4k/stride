import Navbar from "../components/shared/Navbar";
import PaymentStatus from "../components/payment/PaymentStatus";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CompletionPage = () => {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4">
        {/* Wrap in Elements so PaymentStatus can use useStripe() */}
        <Elements stripe={stripePromise}>
          <PaymentStatus />
        </Elements>
      </main>
    </div>
  );
};

export default CompletionPage;
