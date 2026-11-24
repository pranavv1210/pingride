# PingRide WhatsApp Setup

## Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```txt
WHATSAPP_VERIFY_TOKEN=make-a-random-secret-like-pingride-verify-123
WHATSAPP_ACCESS_TOKEN=your_meta_cloud_api_access_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_APP_SECRET=your_meta_app_secret
```

## Meta Webhook

After deployment, your webhook URL is:

```txt
https://YOUR-VERCEL-DOMAIN.vercel.app/api/whatsapp
```

In Meta Developers:

1. Open your app.
2. Go to WhatsApp > Configuration.
3. Set Callback URL to the URL above.
4. Set Verify Token to the exact same value as `WHATSAPP_VERIFY_TOKEN`.
5. Verify and save.
6. Subscribe to the `messages` webhook field.
7. In your Meta app's Basic settings, copy the App Secret into `WHATSAPP_APP_SECRET` in Vercel.

## Test Flow

From your personal WhatsApp, send `Hi` to the connected PingRide business number.

The demo flow supports:

```txt
Hi
Cab / Auto / Bike
Share location
Airport
Confirm Ride
```

## Notes

Every incoming POST is verified against Meta's `X-Hub-Signature-256` using `WHATSAPP_APP_SECRET`. The webhook returns 503 until that secret is configured and rejects missing or invalid signatures. The public diagnostics endpoint reports configuration presence only; it never returns token fragments or identifiers.

This is a prototype webhook. It does not persist state in a database yet. For a real production flow on Vercel, add a database such as Supabase, Neon, or Vercel KV/Upstash Redis to store each user's ride state.
