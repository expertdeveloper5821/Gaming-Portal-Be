import mongoose, { Schema } from "mongoose";

// Schema for qrCodeImg
const qrCodeImgSchema: Schema = new Schema(
  {
    qrCodeImg: {
      type: String,
      required: true,
    },
    uuid: {
        type: String,
        required: true,
      },
  },
  { timestamps: true }
);

// Schema for the rest of the fields
const transactionSchema: Schema = new Schema(
  {
    upiId: {
      type: String,
      required: false,
    },
    matchAmount: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    paymentBy: {
      type: String, // Assuming the user ID is a string
      required: false,
    },
  },
  { timestamps: true }
);

// Create models using the schemas
const QrCodeImg = mongoose.model("QrCodeImg", qrCodeImgSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

export { QrCodeImg, Transaction };
