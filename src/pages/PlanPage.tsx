import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Star } from "lucide-react";

// Replace with your deployed Supabase Edge Function URL
const CREATE_PAYMENT_URL = "https://elhotvkkvbwxeuquqolc.supabase.co/functions/v1/create-ziina-payment";

const PLANS = [
  { id: "monthly", label: "Monthly", price: 299, description: "Perfect for getting started", features: ["Full access", "24/7 support", "Cancel anytime"] },
  { id: "semiannual", label: "Semiannual", price: 699, description: "Best value for teams", features: ["Full access", "Priority support", "Team collaboration", "Advanced analytics"], popular: true },
  { id: "annual", label: "Annual", price: 899, description: "Maximum savings", features: ["Full access", "Priority support", "Team collaboration", "Advanced analytics", "Custom integrations"] },
];

export default function PlanPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (planId: string) => {
    setLoadingId(planId);
    setError("");

    try {
      const res = await fetch(CREATE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || `HTTP error ${res.status}`);
      }

      if (!data?.checkout_url) throw new Error("No checkout URL returned");

      // Redirect to Ziina checkout page
      window.location.href = data.checkout_url;
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Something went wrong");
      setLoadingId(null);
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure checkout powered by Ziina. Start your journey today with our flexible pricing options.
          </p>
        </motion.div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-red-600 text-sm font-bold">!</div>
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
              plan.popular ? 'border-blue-500 scale-105' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.label}</h2>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 ml-2">AED</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={!!loadingId}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loadingId === plan.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Subscribe Now
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500 text-sm">
          Secure payment processing • 256-bit SSL encryption • Cancel anytime
        </p>
      </div>
    </div>
  );
}
