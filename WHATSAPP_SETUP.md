# PingRide WhatsApp Setup

## Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```txt
WHATSAPP_VERIFY_TOKEN=make-a-random-secret-like-pingride-verify-123
WHATSAPP_ACCESS_TOKEN=your_meta_cloud_api_access_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_GRAPH_VERSION=v23.0
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

This is a prototype webhook. It does not persist state in a database yet. For a real production flow on Vercel, add a database such as Supabase, Neon, or Vercel KV/Upstash Redis to store each user's ride state.
