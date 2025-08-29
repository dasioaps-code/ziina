const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: CORS });

  try {
    const payload = await req.json();
    console.log("🔔 Ziina webhook:", payload);

    // TODO: Insert into Supabase DB if needed
    // e.g., mark subscription active if payload.status === "succeeded"

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...CORS },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook failed" }), {
      headers: { "Content-Type": "application/json", ...CORS },
      status: 500,
    });
  }
});