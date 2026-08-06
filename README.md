# Tyler's Automobile Parts & Supply — Setup Guide

This is a real, self-hosted online store: customers browse your inventory and pay by
card through Stripe Checkout. You host it for free on Vercel. No server to babysit.

You do NOT need to know how to code to follow these steps — just follow them in order.

---

## What you're setting up

- **The storefront** (`public/index.html`) — what customers see. They can browse, search,
  and buy. That's it — no way to add, edit, or remove listings from here.
- **The admin page** (`public/admin.html`) — a separate, password-protected page for you.
  This is where you post parts, remove sold/old listings, and update your contact info.
  Customers are never linked to this page and can't do anything on the storefront without
  the password even if they find the URL, since the password is checked on the server.
- **A small backend** (`api/` folder) — handles listing parts and starting checkout securely.
  Card numbers never touch your code; Stripe handles that part.
- **A database** (Vercel KV) — stores your product listings and shop info so they persist.
- **Stripe** — processes the actual credit card payments and pays out to your bank account.

---

## Step 1: Create accounts (both free)

1. Go to https://vercel.com and sign up (GitHub login is easiest).
2. Go to https://stripe.com and sign up for a Stripe account. You can start in **test mode**
   (fake payments, for trying things out) and switch to live mode later.

## Step 2: Get your Stripe test key

1. In the Stripe dashboard, make sure the toggle in the top right says **Test mode**.
2. Go to **Developers > API keys**.
3. Copy the **Secret key** (starts with `sk_test_...`). Keep it private — never put it in
   the website's HTML or share it publicly.

## Step 3: Put this project on GitHub

1. Create a free GitHub account if you don't have one: https://github.com
2. Create a new repository (e.g. `tylers-auto-parts`).
3. Upload everything in this folder to that repository (GitHub's "Add file > Upload files"
   in the browser works fine — no command line needed).

## Step 4: Deploy on Vercel

1. In Vercel, click **Add New > Project**, and import the GitHub repo you just made.
2. Click **Deploy**. It'll fail on the first try because we haven't added the database or
   Stripe key yet — that's expected, continue to Step 5.

## Step 5: Add the database (Vercel KV)

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database > KV** (it's on the free tier for a store this size).
3. Connect it to your project. Vercel automatically adds the required `KV_...`
   environment variables for you — you don't need to type these in yourself.

## Step 6: Add your Stripe key and admin password

1. In your Vercel project, go to **Settings > Environment Variables**.
2. Add a variable named `STRIPE_SECRET_KEY` with the value you copied in Step 2.
3. Add a second variable named `ADMIN_PASSWORD` and set it to a password only you know
   — this is what unlocks `/admin.html` so you can post and manage parts.
4. Redeploy (Vercel's **Deployments** tab > click the three dots on the latest one > **Redeploy**).

Your storefront is now live at a URL like `https://tylers-auto-parts.vercel.app`.
Your admin page is at `https://tylers-auto-parts.vercel.app/admin.html` — bookmark it,
don't share it. Test checkout with Stripe's test card `4242 4242 4242 4242`, any future
expiry date, any CVC.

## Step 7: Get notified when someone pays (webhook)

This step makes a part automatically disappear from your inventory once it's sold.

1. In Stripe, go to **Developers > Webhooks > Add endpoint**.
2. Endpoint URL: `https://YOUR-VERCEL-URL/api/webhook`
3. Select the event `checkout.session.completed`.
4. After creating it, Stripe shows a **Signing secret** (starts with `whsec_...`).
5. Back in Vercel, add another environment variable: `STRIPE_WEBHOOK_SECRET` with that value.
6. Redeploy again.

## Step 8: Go live for real payments

1. In Stripe, flip the toggle from **Test mode** to **Live mode**.
2. Get your live secret key from **Developers > API keys** (starts with `sk_live_...`).
3. Update the `STRIPE_SECRET_KEY` environment variable in Vercel with the live key.
4. Repeat the webhook step (Step 7) in live mode — test-mode and live-mode webhooks are separate.
5. Add your bank account in Stripe under **Settings > Payouts** so you actually get paid.

## Step 9 (optional): Use your own domain

In Vercel, go to **Settings > Domains** and add a domain you own (e.g. `tylersautoparts.com`,
bought from any registrar like Namecheap or Google Domains). Vercel walks you through the DNS
records to add at your registrar.

---

## Things worth knowing

- **Customers can only browse and buy.** The storefront (`index.html`) has no posting,
  editing, or removing capability at all — those actions live only on `/admin.html`,
  and the server rejects any add/remove/edit request that doesn't include your correct
  `ADMIN_PASSWORD`. That check happens on the backend, not just by hiding buttons, so it
  holds even if someone finds or guesses the admin URL.
- **Keep your admin password real.** Anyone who has it can post or delete listings and
  change your contact info. Don't reuse a password from another account.
- **Fees**: Stripe takes roughly 2.9% + $0.30 per successful card charge (see stripe.com/pricing
  for current rates) — Vercel and the database are free at this scale.
- **Where the money goes**: Stripe deposits into your connected bank account on its normal
  payout schedule (usually a couple of days), not instantly.
