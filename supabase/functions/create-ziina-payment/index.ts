const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 299,
  semiannual: 699,
  annual: 899,
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 405 
      }
    );
  }

  try {
    // Get environment variables
    const ZIINA_API_KEY = Deno.env.get("ZIINA_API_KEY");
    const FRONTEND_BASE_URL = Deno.env.get("FRONTEND_BASE_URL") || "http://localhost:5173";

    console.log("Environment check:", {
      hasZiinaKey: !!ZIINA_API_KEY,
      frontendUrl: FRONTEND_BASE_URL
    });

    // Check if API key exists
    if (!ZIINA_API_KEY) {
      console.error("ZIINA_API_KEY is missing");
      return new Response(
        JSON.stringify({ 
          error: "Payment service not configured. Please add ZIINA_API_KEY to edge function secrets." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    const { planId } = requestBody;
    console.log("Received planId:", planId);

    // Validate planId
    if (!planId || !(planId in PLAN_AMOUNTS)) {
      console.error("Invalid planId:", planId);
      return new Response(
        JSON.stringify({ 
          error: "Invalid planId. Must be one of: monthly, semiannual, annual" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    const amount = PLAN_AMOUNTS[planId];
    console.log("Processing payment for plan:", planId, "amount:", amount);

    // Prepare Ziina API request
    const ziinaPayload = {
      amount,
      currency: "AED",
      description: `Subscription: ${planId}`,
      redirect_url: `${FRONTEND_BASE_URL}/payment-success`,
      cancel_url: `${FRONTEND_BASE_URL}/payment-failed`,
      metadata: { planId }
    };

    console.log("Ziina payload:", ziinaPayload);

    // Call Ziina API
    let ziinaResponse;
    try {
      ziinaResponse = await fetch("https://api.ziina.com/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ZIINA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ziinaPayload),
      });
    } catch (fetchError) {
      console.error("Network error calling Ziina API:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Network error connecting to payment service",
          details: fetchError.message 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("Ziina response status:", ziinaResponse.status);

    // Parse Ziina response
    let ziinaData;
    try {
      ziinaData = await ziinaResponse.json();
    } catch (parseError) {
      console.error("Failed to parse Ziina response:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid response from payment service" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("Ziina response data:", ziinaData);

    // Check if Ziina request was successful
    if (!ziinaResponse.ok) {
      console.error("Ziina API error:", ziinaResponse.status, ziinaData);
      return new Response(
        JSON.stringify({ 
          error: "Payment service error",
          status: ziinaResponse.status,
          details: ziinaData 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Validate response has checkout_url
    if (!ziinaData.checkout_url) {
      console.error("Missing checkout_url in Ziina response:", ziinaData);
      return new Response(
        JSON.stringify({ 
          error: "Invalid payment response - missing checkout URL" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("Payment session created successfully:", ziinaData.checkout_url);

    // Return success response
    return new Response(
      JSON.stringify({ checkout_url: ziinaData.checkout_url }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("Unexpected error in create-ziina-payment function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});