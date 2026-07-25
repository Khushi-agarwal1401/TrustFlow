import Razorpay from "razorpay"

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_dummy_id_for_build",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_dummy_secret_for_build",
})
