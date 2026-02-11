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

const TO_EMAIL = Deno.env.get("BOOKING_TO_EMAIL") ?? "marclopezclavero@gmail.com";
const FROM_EMAIL = Deno.env.get("BOOKING_FROM_EMAIL") ?? "onboarding@resend.dev";

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
    // NOTA: Para usar un dominio propio en "from", debes verificar el dominio en Resend:
    // https://resend.com/domains - Añade registros DNS para verificar tu dominio
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Usando onboarding@resend.dev que es válido sin verificar dominio
        // Para dominio propio: "Hemsedal Motors <bookings@mi-dominio.com>"
        from: `Hemsedal Motors <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        subject: `Nueva reserva de ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">
              Nueva Solicitud de Reserva
            </h1>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>👤 Nombre:</strong> ${name}</p>
              <p><strong>📞 Contacto:</strong> ${contact}</p>
              <p><strong>📅 Fecha:</strong> ${date}</p>
              <p><strong>📝 Notas:</strong> ${notes || "Sin notas adicionales"}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Este email fue enviado desde el formulario de reservas de Hemsedal Motors.
            </p>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(`Resend API error: ${JSON.stringify(emailData)}`);
    }

    console.log("Booking email sent successfully to:", TO_EMAIL, emailData);

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
