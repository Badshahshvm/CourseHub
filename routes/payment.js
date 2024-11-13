const express = require("express");
const { getRazorPayKey, buySubscription, verifySubscription, cancelSubscription, allPayments, verifyPayments } = require("../controllers/payment");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();

router.get("/razorpay-key", checkAuth, getRazorPayKey)
router.post("/subscribe", checkAuth, buySubscription)
router.post("/verify", checkAuth, verifyPayments)
router.post("/unsubscribe", checkAuth, cancelSubscription)
router.get("/", checkAuth, allPayments)//authorized hona chaiye
module.exports = router;