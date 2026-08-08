# Linkroot

**One link. Everything you make.**

Linkroot is a link-in-bio page builder: creators, freelancers, and small
businesses get a single shareable URL (`linkroot.app/you`) that fans out to
every other link that matters — shop, socials, newsletter, latest drop.

This document is both the product spec (as requested — features, user flow,
pricing, landing copy, monetization) and the setup guide for the code in this
folder.

## Why this product

The brief was: find a simple software tool people would actually pay for
monthly, that can be built for free and needs minimal upkeep after launch.
Link-in-bio pages fit all three:

- **Proven willingness to pay.** The category (Linktree, Beacons, Bio.fm) has
  millions of paying users; people already understand what they're buying.
- **Free to build and run.** No third-party AI/API costs. Runs entirely on
  free tiers: Vercel (hosting), Neon or Supabase (Postgres), Stripe (billing,
  only takes a cut on revenue you actually collect).
- **Minimal maintenance.** No scheduled jobs, no external data feeds, no
  content moderation queue. The whole system is: serve a page, save a link,
  redirect a click, listen for one Stripe webhook.

## Core features

- Public profile page at `linkroot.app/<username>` — avatar, display name,
  bio, and an ordered list of link buttons.
- Dashboard to add / edit / reorder / hide / delete links.
- Click tracking: every link click routes through `/r/[linkId]`, which
  increments a counter and 302s to the destination.
- 6 built-in themes (2 free, 4 Pro-gated) — no page builder, just pick and go.
- Email + password auth (NextAuth Credentials + bcrypt). No OAuth
  dependencies to configure before you can demo it.
- Stripe subscription billing: Checkout to upgrade, Billing Portal to manage
  or cancel, one webhook to keep `plan` in sync.

## User flow

1. Visitor lands on the marketing homepage → **Get started free**.
2. Registers with a username, email, password → account created, signed in,
   redirected to `/dashboard`.
3. Adds links (title + URL) → each appears instantly on their public page.
4. Shares `linkroot.app/username` in their Instagram/TikTok/X bio.
5. Fans tap a link → redirected via `/r/[linkId]` (click counted) straight to
   the destination.
6. Once they hit the free plan's 5-link cap, or want analytics/themes, they
   upgrade from **Settings → Billing** → Stripe Checkout → webhook flips
   their `plan` to `PRO` → limits lift immediately.
7. They can cancel anytime via the Stripe Billing Portal; the next webhook
   event drops them back to `FREE` (existing links over the limit are kept,
   just not addable-to, so nothing is destroyed on downgrade).

## Pricing

| | Free | Pro — $4/mo |
|---|---|---|
| Links | Up to 5 | Unlimited |
| Themes | 2 starter themes | All 6 |
| Click analytics | — | Per-link click counts |
| "Made with Linkroot" badge | Shown | Removed |
| Page views | Unlimited | Unlimited |

Free is a real, usable product on its own — that's what makes the upgrade
feel optional rather than a paywall.

## Landing page copy

See `app/page.tsx` for the actual implementation. Headline: *"Your whole
internet. One link in your bio."* Subhead sells the free page as instant and
codeless; primary CTA is "Claim your Linkroot — it's free"; secondary CTA
links to pricing. No fabricated testimonials or user counts are used
anywhere in the copy.

## Monetization strategy

- **Freemium subscription**, not one-time purchase — recurring revenue is
  the whole point of "passive income."
- The free tier's 5-link cap and 2-theme limit are the natural upgrade
  triggers: hit either one mid-workflow (adding a 6th link, wanting a nicer
  theme) and the upsell is right there, not a separate ask.
- Click analytics are Pro-only because they're the feature power users
  (anyone running a business off their bio link) actually need, so it
  filters for willingness to pay rather than gatekeeping the core value.
- No ads, no data resale — the badge on free pages is the only "cost" of not
  paying, and it doubles as free viral distribution for the product.
- At scale, marginal cost per user is close to zero (a row in Postgres, a
  static page render), so gross margin on the $4/mo stays high even before
  volume discounts kick in on hosting/DB.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
NextAuth (Credentials) · Stripe · deployed on Vercel.

## Getting started

```bash
cd linkroot
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum to run locally
npm run db:push        # creates tables from prisma/schema.prisma
npm run dev
```

Open http://localhost:3000.

### Environment variables

See `.env.example`. To run the app at all you need `DATABASE_URL` and
`NEXTAUTH_SECRET` (generate one with `openssl rand -base64 32`). Stripe
variables are only required to exercise the upgrade flow — the app builds
and runs without them, it just can't create Checkout/Portal sessions.

### Deploying for free

1. **Database** — create a free Postgres instance on
   [Neon](https://neon.tech) or [Supabase](https://supabase.com), copy the
   connection string into `DATABASE_URL`.
2. **Hosting** — push this folder to a GitHub repo (or use it as a
   subdirectory deploy) and import it on [Vercel](https://vercel.com)'s free
   tier. Set the same environment variables there.
3. **Stripe** — create a Product + monthly Price in the Stripe dashboard,
   put the price ID in `STRIPE_PRO_PRICE_ID`, and point a webhook endpoint
   at `/api/stripe/webhook` for `checkout.session.completed`,
   `customer.subscription.updated`, and `customer.subscription.deleted`.
4. Run `npm run db:push` once against the production `DATABASE_URL` to
   create the schema.

After that, there is nothing to run on a schedule and nothing to monitor
beyond normal uptime — the whole product is request/response.

## Known follow-ups

- `next audit` currently flags transitive `postcss`/`sharp` advisories that
  are only fixed by the Next.js 16 major release; not upgraded here to avoid
  an untested breaking change, but worth revisiting.
- Click analytics are total counts only; a time-series view (clicks per day)
  would need a `Click` log table — straightforward to add later without
  touching the schema for anything else.
- No password-reset flow yet (Credentials-only auth); would need an email
  provider wired in, which is the one piece of infra this MVP deliberately
  left out to keep maintenance at zero.
