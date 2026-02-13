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
  email?: string;
}

const BOOKING_NOTIFY_TO = Deno.env.get("BOOKING_NOTIFY_TO")
  ?? Deno.env.get("BOOKING_TO_EMAIL")
  ?? "marclopezclavero@gmail.com";

const RESEND_FROM = Deno.env.get("RESEND_FROM")
  ?? Deno.env.get("BOOKING_FROM_EMAIL")
  ?? "Dal Motorer <reservas@dalmotorer.com>";
const SITE_NAME = "Dal Motorer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isResendSandboxSender(fromAddress: string): boolean {
  return /@resend\.dev>?$/i.test(fromAddress.trim());
}

function hasValidRecipient(recipient: string): boolean {
  const normalized = recipient.trim();
  if (EMAIL_PATTERN.test(normalized)) {
    return true;
  }

  const matchWithName = normalized.match(/<([^>]+)>$/);
  return Boolean(matchWithName?.[1] && EMAIL_PATTERN.test(matchWithName[1]));
}

function resolveReplyTo(email?: string, contact?: string): string | undefined {
  const normalizedEmail = email?.trim();
  if (normalizedEmail && EMAIL_PATTERN.test(normalizedEmail)) {
    return normalizedEmail;
  }

  const normalizedContact = contact?.trim();
  if (normalizedContact && EMAIL_PATTERN.test(normalizedContact)) {
    return normalizedContact;
  }

  return undefined;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (isResendSandboxSender(RESEND_FROM)) {
      throw new Error(
        "RESEND_FROM is using resend.dev sandbox sender. Set RESEND_FROM to an address on your verified domain (for example reservas@dalmotorer.com)."
      );
    }

    if (!hasValidRecipient(BOOKING_NOTIFY_TO)) {
      throw new Error(
        "BOOKING_NOTIFY_TO is invalid. Use a valid destination email (for example reservas@dalmotorer.com)."
      );
    }

    const { name, contact, date, notes, email }: BookingRequest = await req.json();

    // Validate required fields
    if (!name || !contact || !date) {
      throw new Error("Missing required fields: name, contact, and date are required");
    }

    const payload: Record<string, unknown> = {
      from: RESEND_FROM,
      to: [BOOKING_NOTIFY_TO],
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
            Este email fue enviado desde el formulario de reservas de ${SITE_NAME}.
          </p>
        </div>
      `,
    };

    const replyTo = resolveReplyTo(email, contact);
    if (replyTo) {
      payload.reply_to = replyTo;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resendResponse.ok) {
      const responseBody = await resendResponse.text();
      console.error("Resend API error", {
        status: resendResponse.status,
        body: responseBody,
      });

      const parsedError = (() => {
        try {
          const json = JSON.parse(responseBody) as { message?: string };
          return json.message;
        } catch {
          return undefined;
        }
      })();

      const reason = parsedError ?? responseBody;
      throw new Error(`Resend API request failed with status ${resendResponse.status}: ${reason}`);
    }

    const data = await resendResponse.json();
    console.log("Booking email sent successfully to:", BOOKING_NOTIFY_TO, data);

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
