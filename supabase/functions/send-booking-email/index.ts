import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

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
const DEFAULT_FROM_EMAIL = "reservas@oldiat.resend.app";

function resolveFromEmail(rawFromEmail: string | undefined): string {
  const configuredFromEmail = rawFromEmail?.trim();

  if (!configuredFromEmail) {
    return DEFAULT_FROM_EMAIL;
  }

  if (configuredFromEmail.toLowerCase().endsWith("@resend.dev")) {
    console.warn(
      `BOOKING_FROM_EMAIL (${configuredFromEmail}) uses Resend's testing domain and is not valid for production recipients. Falling back to ${DEFAULT_FROM_EMAIL}.`
    );
    return DEFAULT_FROM_EMAIL;
  }

  return configuredFromEmail;
}

const FROM_EMAIL = resolveFromEmail(Deno.env.get("BOOKING_FROM_EMAIL"));

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

    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
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
    });

    if (error) {
      console.error("Resend SDK error:", error);
      throw new Error(`Resend SDK error: ${JSON.stringify(error)}`);
    }

    console.log("Booking email sent successfully to:", TO_EMAIL, data);

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
