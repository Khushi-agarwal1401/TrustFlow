import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY?.trim() || "sk_dummy_key_for_build", {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
})
