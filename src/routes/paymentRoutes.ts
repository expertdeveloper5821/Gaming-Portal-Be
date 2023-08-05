import express from "express";
import {
  checkout,
  paymentVerification,
} from "../controllers/paymentController";

const router = express.Router();


router.post('/checkout', checkout)

router.post("/paymentverification", paymentVerification)

export default router;
