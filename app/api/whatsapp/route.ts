import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

type WhatsAppMessage = {
  from: string;
  id: string;
  type: string;
  text?: { body?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  interactive?: {
    type?: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
};

type WebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const requestToken = searchParams.get("hub.verify_token");

  if (mode === "subscribe" && challenge && requestToken === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as WebhookBody;
  const messages =
    body.entry?.flatMap((entry) => entry.changes ?? []).flatMap((change) => change.value?.messages ?? []) ?? [];

  await Promise.all(messages.map((message) => handleMessage(message)));

  return NextResponse.json({ received: true });
}

async function handleMessage(message: WhatsAppMessage) {
  const incoming = getIncomingValue(message);

  if (["hi", "hello", "start", "menu"].includes(incoming)) {
    await sendText(
      message.from,
      "👋 Welcome to PingRide\n\nBook a ride on WhatsApp.\nNo app download. No signup. Just message and go.",
    );
    await sendVehicleButtons(message.from);
    return;
  }

  if (incoming === "vehicle_auto" || incoming.includes("auto")) {
    await sendLocationRequest(message.from);
    return;
  }

  if (incoming === "vehicle_cab" || incoming.includes("cab")) {
    await sendLocationRequest(message.from, "Cab selected. Please share your pickup location.");
    return;
  }

  if (incoming === "vehicle_bike" || incoming.includes("bike")) {
    await sendLocationRequest(message.from, "Bike selected. Please share your pickup location.");
    return;
  }

  if (message.type === "location") {
    await sendDestinationButtons(message.from);
    return;
  }

  if (incoming === "dest_airport" || incoming.includes("airport")) {
    await sendText(message.from, "Checking nearby drivers...\nEstimating fare...\nCalculating fastest route...");
    await sendConfirmRideButtons(message.from);
    return;
  }

  if (incoming === "confirm_ride" || incoming.includes("confirm")) {
    await sendText(
      message.from,
      "✅ Ride confirmed\n\nDriver Ravi Kumar accepted your ride.\nAuto: KA 03 MX 4821\nRating: 4.92 ⭐\nArrival: 4 mins\n\nYour OTP is *4821*.",
    );
    return;
  }

  if (incoming === "cancel_ride" || incoming.includes("cancel")) {
    await sendText(message.from, "Your PingRide request has been cancelled. Send *Hi* whenever you want to book again.");
    return;
  }

  await sendText(message.from, "Send *Hi* to start booking a PingRide.");
}

function getIncomingValue(message: WhatsAppMessage) {
  const interactiveId = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id;
  return (interactiveId || message.text?.body || "").trim().toLowerCase();
}

async function sendVehicleButtons(to: string) {
  await sendInteractiveButtons(to, "How would you like to travel today?", [
    { id: "vehicle_cab", title: "🚖 Cab" },
    { id: "vehicle_auto", title: "🛺 Auto" },
    { id: "vehicle_bike", title: "🏍 Bike" },
  ]);
}

async function sendLocationRequest(to: string, text = "Great choice. Please share your pickup location.") {
  await sendWhatsAppMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      body: `${text}\n\nTap attachment/location in WhatsApp and share your current location.`,
    },
  });
}

async function sendDestinationButtons(to: string) {
  await sendInteractiveButtons(to, "Pickup confirmed: Whitefield, Bengaluru.\n\nWhere would you like to go?", [
    { id: "dest_home", title: "🏠 Home" },
    { id: "dest_office", title: "🏢 Office" },
    { id: "dest_airport", title: "✈ Airport" },
  ]);
}

async function sendConfirmRideButtons(to: string) {
  await sendInteractiveButtons(to, "Auto to Kempegowda International Airport\n\nDistance: 34 km\nETA: 4 mins\nEstimated fare: ₹612", [
    { id: "confirm_ride", title: "Confirm Ride" },
    { id: "cancel_ride", title: "Cancel" },
  ]);
}

async function sendText(to: string, body: string) {
  await sendWhatsAppMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body },
  });
}

async function sendInteractiveButtons(to: string, body: string, buttons: Array<{ id: string; title: string }>) {
  await sendWhatsAppMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.map((button) => ({
          type: "reply",
          reply: button,
        })),
      },
    },
  });
}

async function sendWhatsAppMessage(payload: unknown) {
  if (!token || !phoneNumberId) {
    console.error("Missing WhatsApp env vars: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return;
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("WhatsApp send failed", response.status, await response.text());
  }
}
