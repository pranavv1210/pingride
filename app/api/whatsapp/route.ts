import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

type Vehicle = "Cab" | "Auto" | "Bike";
type Destination = "Home" | "Office" | "Airport";
type RideState = {
  step: "idle" | "vehicle" | "pickup" | "destination" | "fare" | "driver" | "tracking" | "payment" | "rating";
  vehicle?: Vehicle;
  pickup?: string;
  destination?: Destination;
  fare?: RideQuote;
};

type RideQuote = {
  destination: Destination;
  drop: string;
  distance: string;
  duration: string;
  eta: string;
  fare: string;
};

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

const sessions = new Map<string, RideState>();

const quotes: Record<Destination, RideQuote> = {
  Home: {
    destination: "Home",
    drop: "Prestige Lakeside Habitat",
    distance: "7.2 km",
    duration: "18 mins",
    eta: "3 mins",
    fare: "₹186",
  },
  Office: {
    destination: "Office",
    drop: "Manyata Tech Park",
    distance: "21 km",
    duration: "41 mins",
    eta: "5 mins",
    fare: "₹428",
  },
  Airport: {
    destination: "Airport",
    drop: "Kempegowda International Airport T2",
    distance: "34 km",
    duration: "52 mins",
    eta: "4 mins",
    fare: "₹612",
  },
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
  const from = message.from;
  const incoming = getIncomingValue(message);
  const session = sessions.get(from) ?? { step: "idle" };

  if (["hi", "hello", "start", "menu", "restart"].includes(incoming)) {
    sessions.set(from, { step: "vehicle" });
    await sendWelcome(from);
    await sendVehicleButtons(from);
    return;
  }

  if (incoming === "help" || incoming === "support") {
    await sendSupportMenu(from);
    return;
  }

  if (incoming === "sos" || incoming === "emergency") {
    await sendEmergencyCard(from);
    return;
  }

  if (incoming === "history") {
    await sendText(
      from,
      "Your recent PingRide trips:\n\n1. Whitefield → Airport T2 — ₹612 — 5★\n2. Indiranagar → MG Road — ₹184 — 5★\n3. HSR Layout → Koramangala — ₹129 — 4★\n\nSend *Hi* to book again.",
    );
    return;
  }

  if (incoming.startsWith("vehicle_") || ["cab", "auto", "bike"].some((item) => incoming.includes(item))) {
    const vehicle = parseVehicle(incoming);
    sessions.set(from, { ...session, step: "pickup", vehicle });
    await sendText(from, `${vehicle} selected. Please share your pickup location.\n\nTap attachment/location in WhatsApp and share your current location.`);
    return;
  }

  if (message.type === "location") {
    sessions.set(from, { ...session, step: "destination", pickup: "Whitefield, Bengaluru" });
    await sendDestinationButtons(from);
    return;
  }

  if (incoming.startsWith("dest_") || ["home", "office", "airport"].some((item) => incoming.includes(item))) {
    const destination = parseDestination(incoming);
    const fare = quotes[destination];
    sessions.set(from, { ...session, step: "fare", destination, fare });
    await sendText(from, "Checking nearby drivers...\nEstimating fare...\nCalculating fastest route...");
    await sendConfirmRideButtons(from, session.vehicle ?? "Auto", fare);
    return;
  }

  if (incoming === "confirm_ride" || incoming.includes("confirm")) {
    const fare = session.fare ?? quotes.Airport;
    sessions.set(from, { ...session, step: "driver", fare });
    await sendText(from, "Searching nearby verified drivers...\n\nDriver 1: No response\nDriver 2: Busy\nDriver 3: Accepted");
    await sendDriverCard(from, fare);
    return;
  }

  if (incoming === "track_ride" || incoming.includes("track")) {
    sessions.set(from, { ...session, step: "tracking" });
    await sendText(
      from,
      "Live tracking started.\n\nDriver Ravi is 4 mins away.\nVehicle: KA 03 MX 4821\nShare trip: https://pingride-nine.vercel.app",
    );
    await sendInteractiveButtons(from, "What would you like to do?", [
      { id: "show_otp", title: "Show OTP" },
      { id: "share_trip", title: "Share Trip" },
      { id: "sos", title: "SOS" },
    ]);
    return;
  }

  if (incoming === "show_otp" || incoming.includes("otp")) {
    await sendInteractiveButtons(from, "Driver has arrived.\n\nYour ride OTP is *4821*.\nShare it only after boarding.", [
      { id: "ride_started", title: "Ride Started" },
      { id: "call_driver", title: "Call Driver" },
      { id: "sos", title: "SOS" },
    ]);
    return;
  }

  if (incoming === "ride_started") {
    await sendInteractiveButtons(from, "Ride started.\n\nRoute locked. ETA to destination: 46 mins.\nWe will keep your trip link active for family.", [
      { id: "complete_ride", title: "Complete Ride" },
      { id: "share_trip", title: "Share Trip" },
      { id: "sos", title: "SOS" },
    ]);
    return;
  }

  if (incoming === "complete_ride") {
    sessions.set(from, { ...session, step: "payment" });
    await sendPaymentButtons(from, session.fare ?? quotes.Airport);
    return;
  }

  if (incoming === "pay_upi" || incoming === "pay_cash") {
    sessions.set(from, { ...session, step: "rating" });
    await sendReceipt(from, incoming === "pay_upi" ? "UPI paid" : "Cash collected", session.fare ?? quotes.Airport);
    return;
  }

  if (incoming.startsWith("rate_")) {
    sessions.set(from, { step: "idle" });
    await sendText(from, "Thank you for choosing PingRide ❤️\n\nHope to ride with you again.\n\nSend *Hi* anytime to book your next ride.");
    return;
  }

  if (incoming === "share_trip") {
    await sendText(from, "Trip link shared with your emergency contact.\n\nLive tracking: https://pingride-nine.vercel.app");
    return;
  }

  if (incoming === "call_driver") {
    await sendText(from, "Calling Ravi Kumar: +91 98765 43210\n\nThis is simulated for the prototype.");
    return;
  }

  if (incoming === "cancel_ride" || incoming.includes("cancel")) {
    sessions.set(from, { step: "idle" });
    await sendText(from, "Your PingRide request has been cancelled. Send *Hi* whenever you want to book again.");
    return;
  }

  await sendText(from, "I can help you book a ride.\n\nSend *Hi* to start, *History* for recent rides, *Support* for help, or *SOS* for emergency options.");
}

function getIncomingValue(message: WhatsAppMessage) {
  const interactiveId = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id;
  return (interactiveId || message.text?.body || "").trim().toLowerCase();
}

function parseVehicle(incoming: string): Vehicle {
  if (incoming.includes("cab")) return "Cab";
  if (incoming.includes("bike")) return "Bike";
  return "Auto";
}

function parseDestination(incoming: string): Destination {
  if (incoming.includes("office")) return "Office";
  if (incoming.includes("airport")) return "Airport";
  return "Home";
}

async function sendWelcome(to: string) {
  await sendText(
    to,
    "👋 Welcome to PingRide\n\nBook a ride on WhatsApp.\nNo app download. No signup. Just message and go.",
  );
}

async function sendVehicleButtons(to: string) {
  await sendInteractiveButtons(to, "How would you like to travel today?", [
    { id: "vehicle_cab", title: "🚖 Cab" },
    { id: "vehicle_auto", title: "🛺 Auto" },
    { id: "vehicle_bike", title: "🏍 Bike" },
  ]);
}

async function sendDestinationButtons(to: string) {
  await sendInteractiveButtons(to, "Pickup confirmed: Whitefield, Bengaluru.\n\nWhere would you like to go?", [
    { id: "dest_home", title: "🏠 Home" },
    { id: "dest_office", title: "🏢 Office" },
    { id: "dest_airport", title: "✈ Airport" },
  ]);
}

async function sendConfirmRideButtons(to: string, vehicle: Vehicle, fare: RideQuote) {
  await sendInteractiveButtons(
    to,
    `${vehicle} to ${fare.drop}\n\nDistance: ${fare.distance}\nTrip time: ${fare.duration}\nPickup ETA: ${fare.eta}\nEstimated fare: ${fare.fare}`,
    [
      { id: "confirm_ride", title: "Confirm Ride" },
      { id: "cancel_ride", title: "Cancel" },
    ],
  );
}

async function sendDriverCard(to: string, fare: RideQuote) {
  await sendInteractiveButtons(
    to,
    `✅ Ride confirmed\n\nDriver: Ravi Kumar\nRating: 4.92 ⭐\nVehicle: Bajaj RE Compact\nNumber: KA 03 MX 4821\nArrival: ${fare.eta}\nOTP: 4821`,
    [
      { id: "track_ride", title: "Track Ride" },
      { id: "call_driver", title: "Call Driver" },
      { id: "cancel_ride", title: "Cancel Ride" },
    ],
  );
}

async function sendPaymentButtons(to: string, fare: RideQuote) {
  await sendInteractiveButtons(to, `Ride completed.\n\nFinal fare: ${fare.fare}\nChoose payment method.`, [
    { id: "pay_upi", title: "UPI" },
    { id: "pay_cash", title: "Cash" },
  ]);
}

async function sendReceipt(to: string, payment: string, fare: RideQuote) {
  await sendText(
    to,
    `🧾 PingRide receipt\n\nPickup: Whitefield, Bengaluru\nDestination: ${fare.drop}\nDistance: ${fare.distance}\nFare: ${fare.fare}\nDriver: Ravi Kumar\nVehicle: KA 03 MX 4821\nPayment: ${payment}\nStatus: Paid`,
  );
  await sendInteractiveButtons(to, "How was your ride with Ravi?", [
    { id: "rate_5", title: "★★★★★" },
    { id: "rate_4", title: "★★★★" },
    { id: "support", title: "Need Help" },
  ]);
}

async function sendSupportMenu(to: string) {
  await sendInteractiveButtons(to, "PingRide Support\n\nWhat do you need help with?", [
    { id: "support_fare", title: "Fare Issue" },
    { id: "support_lost", title: "Lost Item" },
    { id: "sos", title: "Emergency" },
  ]);
}

async function sendEmergencyCard(to: string) {
  await sendText(
    to,
    "🚨 Emergency options\n\nPolice: 112\nFamily contact: notified\nLive location: shared\nPingRide safety desk: alerted\n\nIf you are in immediate danger, call local emergency services now.",
  );
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
