import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BookingRequest {
  name: string;
  contact: string;
  date: string;
  notes: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { name, contact, date, notes }: BookingRequest = await req.json();

    // Validate required fields
    if (!name || !contact || !date) {
      throw new Error("Missing required fields: name, contact, and date are required");
    }

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hemsedal Motors <onboarding@resend.dev>",
        to: ["kontakt@hemsedalmotors.no"], // Cambia esto a tu email real
        subject: `Nueva reserva de ${name}`,
        html: `
          <h1>Nueva Solicitud de Reserva</h1>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Contacto:</strong> ${contact}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Notas:</strong> ${notes || "Sin notas"}</p>
          <hr />
          <p>Este email fue enviado desde el formulario de reservas de Hemsedal Motors.</p>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(emailData)}`);
    }

    console.log("Booking email sent successfully:", emailData);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-booking-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
