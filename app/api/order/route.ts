import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ORDER_EMAIL } from "../../site-config";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderPayload = {
  items: OrderItem[];
  name: string;
  email: string;
  notes: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const currency = (amount: number) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<OrderPayload>;

  if (typeof body.email !== "string" || !EMAIL_RE.test(body.email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  const items = Array.isArray(body.items)
    ? body.items.filter(
        (item): item is OrderItem =>
          typeof item?.name === "string" &&
          typeof item?.quantity === "number" &&
          item.quantity > 0 &&
          typeof item?.price === "number",
      )
    : [];

  if (items.length === 0) {
    return NextResponse.json({ error: "No items in order." }, { status: 400 });
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  const lines = items.map(
    (item) =>
      `${item.quantity}x ${item.name} - ${currency(item.price * item.quantity)}`,
  );

  const text = [
    "Musubi order for pickup:",
    "",
    ...lines,
    "",
    `Total: ${currency(total)}`,
    "",
    `Name: ${name || "(not provided)"}`,
    `Email: ${body.email}`,
    `Notes: ${notes || "(none)"}`,
  ].join("\n");

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.error(
      "GMAIL_USER / GMAIL_APP_PASSWORD are not set — see .env.local.example",
    );
    return NextResponse.json(
      { error: "Email sending is not configured yet." },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  try {
    await transporter.sendMail({
      from: gmailUser,
      to: ORDER_EMAIL,
      replyTo: body.email,
      subject: `Musubi Man order${name ? ` — ${name}` : ""}`,
      text,
    });
  } catch (error) {
    console.error("Failed to send order email", error);
    return NextResponse.json(
      { error: "Failed to send order." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
