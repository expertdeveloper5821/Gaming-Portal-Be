import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String, // Assuming the user ID is a string
    required: true,
  },

});

export const Payment = mongoose.model("Payment", paymentSchema);
