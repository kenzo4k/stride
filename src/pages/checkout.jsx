import React from "react";
import { useParams } from "react-router-dom";
import StripeContainer from "../components/payment/StripeContainer";

const Checkout = () => {
  // Grab the course ID from the URL (e.g., /checkout/123)
  const { id } = useParams();

  return (
    /* Removed Navbar and Footer as they are provided by MainLayout */
    /* Added pt-28 to prevent the content from being hidden behind the sticky navbar */
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col pt-28">
      <main className="flex-grow container mx-auto px-4 pb-20 flex flex-col md:flex-row gap-12 items-start">
        {/* Course Summary */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-4xl font-bold italic">Secure Checkout</h1>
          <p className="text-gray-400 text-lg">
            Complete your payment to get instant access to your course and start
            learning on your schedule.
          </p>

          <div className="p-6 bg-[#161b22] border border-gray-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">
              Total Due Today
            </h2>
            <p className="text-3xl font-bold">$49.00</p>
            {id && (
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
                Course ID: {id}
              </p>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <div className="md:w-1/2 w-full bg-[#161b22] p-8 border border-gray-800 rounded-2xl shadow-2xl transition-all hover:border-gray-700">
          {/* Pass the dynamic ID to the StripeContainer */}
          <StripeContainer amount={4900} courseId={id} />
        </div>
      </main>
    </div>
  );
};

export default Checkout;
