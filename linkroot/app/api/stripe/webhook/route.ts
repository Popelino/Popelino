import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      const subscriptionId = checkoutSession.subscription as string | null;
      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await db.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            stripeSubscriptionId: subscription.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await db.user.findUnique({ where: { stripeCustomerId: subscription.customer as string } });
      if (user) {
        const active = subscription.status === "active" || subscription.status === "trialing";
        await db.user.update({
          where: { id: user.id },
          data: {
            plan: active ? "PRO" : "FREE",
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
