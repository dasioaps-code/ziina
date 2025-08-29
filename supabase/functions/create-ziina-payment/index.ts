import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FRONTEND_BASE_URL = Deno.env.get("FRONTEND_BASE_URL") || "http://localhost:5173";

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 299,
  semiannual: 699,
  annual: 899,
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...CORS, "Content-Type": "application/json" }, status: 405 },
    );
  }

  try {
    // Check if ZIINA_API_KEY is available
    const ZIINA_API_KEY = Deno.env.get("ZIINA_API_KEY");
    if (!ZIINA_API_KEY) {
      console.error("ZIINA_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "Payment service configuration error. Please contact support." }),
        { headers: { ...CORS, "Content-Type": "application/json" }, status: 500 },
      );
    }

    const { planId } = await req.json().catch(() => ({}));
    if (!planId || !(planId in PLAN_AMOUNTS)) {
      return new Response(
        JSON.stringify({ error: "Invalid planId" }),
        { headers: { ...CORS, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const amount = PLAN_AMOUNTS[planId];

    // Call Ziina API to create payment session
    const ziinaRes = await fetch("https://api.ziina.com/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "AED",
        description: `Subscription: ${planId}`,
        redirect_url: `${FRONTEND_BASE_URL}/payment-success`,
        cancel_url: `${FRONTEND_BASE_URL}/payment-failed`,
        metadata: { planId },
      }),
    });

    const ziinaData = await ziinaRes.json();

    if (!ziinaRes.ok) {
      console.error("Ziina error:", ziinaData);
      return new Response(
        JSON.stringify({ error: "Failed to create payment", details: ziinaData }),
        { headers: { ...CORS, "Content-Type": "application/json" }, status: 500 },
      );
    }

    return new Response(
      JSON.stringify({ checkout_url: ziinaData.checkout_url }),
      { headers: { ...CORS, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...CORS, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
 