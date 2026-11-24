import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasAccessToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const hasPhoneNumberId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasVerifyToken = Boolean(process.env.WHATSAPP_VERIFY_TOKEN);
  const hasAppSecret = Boolean(process.env.WHATSAPP_APP_SECRET);

  return NextResponse.json({
    ok: hasAccessToken && hasPhoneNumberId && hasVerifyToken && hasAppSecret,
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION || "v23.0",
    hasAccessToken,
    hasPhoneNumberId,
    hasVerifyToken,
    hasAppSecret,
  });
}
