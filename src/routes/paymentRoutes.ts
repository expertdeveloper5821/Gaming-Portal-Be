import express from "express";
import {
  checkout,
  paymentVerification,
} from "../controllers/paymentController";

import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();


router.post('/checkout', checkout)

router.post("/paymentverification", verifyToken, paymentVerification)

export default router;
