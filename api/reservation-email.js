import { Resend } from "resend";

const DEFAULT_FROM = "Dal Motorer <reservations@dalmotorer.com>";

const getEnv = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const notifyEmail = process.env.RESERVATION_NOTIFY_EMAIL;

  return { apiKey, from, notifyEmail };
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const buildReservationHtml = (reservation) => {
  const rows = Object.entries(reservation)
    .filter(([, value]) => value !== undefined && value !== null && `${value}`.trim() !== "")
    .map(([key, value]) => `<tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>${key}</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${String(value)}</td></tr>`)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;">
      <h2>Nueva reserva recibida</h2>
      <p>Se ha creado una nueva reserva desde la web.</p>
      <table style="border-collapse:collapse;border:1px solid #ddd;">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!req.headers["content-type"]?.includes("application/json")) {
    return res.status(415).json({ ok: false, error: "Content-Type must be application/json" });
  }

  const { apiKey, from, notifyEmail } = getEnv();

  if (!apiKey) {
    console.error("[reservation-email] Missing RESEND_API_KEY");
    return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY" });
  }

  if (!notifyEmail) {
    console.error("[reservation-email] Missing RESERVATION_NOTIFY_EMAIL");
    return res.status(500).json({ ok: false, error: "Missing RESERVATION_NOTIFY_EMAIL" });
  }

  const reservation = req.body ?? {};
  const requiredFields = ["name", "email", "car", "dateFrom", "dateTo"];
  const missingFields = requiredFields.filter((field) => !isNonEmptyString(reservation[field]));

  if (missingFields.length > 0) {
    return res.status(400).json({
      ok: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  const resend = new Resend(apiKey);
  const subject = `Nueva reserva: ${reservation.car} (${reservation.dateFrom} → ${reservation.dateTo})`;

  try {
    console.log("[reservation-email] Sending reservation email", {
      to: notifyEmail,
      from,
      subject,
      customerEmail: reservation.email,
    });

    const { data, error } = await resend.emails.send({
      from,
      to: [notifyEmail],
      subject,
      html: buildReservationHtml(reservation),
      replyTo: reservation.email,
    });

    if (error) {
      console.error("[reservation-email] Resend returned error", {
        name: error.name,
        message: error.message,
      });
      return res.status(502).json({ ok: false, error: "Failed to send email" });
    }

    console.log("[reservation-email] Email sent", { id: data?.id });
    return res.status(200).json({ ok: true, id: data?.id ?? null });
  } catch (error) {
    console.error("[reservation-email] Unexpected error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
