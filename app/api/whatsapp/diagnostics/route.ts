import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "";

  return NextResponse.json({
    ok: true,
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION || "v23.0",
    hasAccessToken: accessToken.length > 20,
    accessTokenPrefix: accessToken ? accessToken.slice(0, 6) : null,
    phoneNumberId,
    verifyTokenMatchesExpected: verifyToken === "pingride-verify-123",
  });
}
