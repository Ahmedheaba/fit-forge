/**
 * Payment Routes — Stripe + Cash on Visit
 */

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { protect, restrictTo } = require("../middleware/auth");
const Plan = require("../models/Plan");
const User = require("../models/User");
const { sendSubscriptionSuccessEmail } = require("../config/email");

// ─── STRIPE CHECKOUT ──────────────────────────────────────────────────────────

router.post("/create-checkout-session", protect, async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: "Plan not found or unavailable." });
    }
    const user = await User.findById(req.user._id);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `FitForge — ${plan.name}`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        planId: plan._id.toString(),
        planName: plan.name,
        planDurationValue: plan.duration.value.toString(),
        planDurationUnit: plan.duration.unit,
        planPrice: plan.price.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/plans`,
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        try {
          const {
            userId,
            planId,
            planName,
            planDurationValue,
            planDurationUnit,
            planPrice,
          } = session.metadata;
          const startDate = new Date();
          const endDate = new Date();
          const value = parseInt(planDurationValue);
          switch (planDurationUnit) {
            case "day":
              endDate.setDate(endDate.getDate() + value);
              break;
            case "week":
              endDate.setDate(endDate.getDate() + value * 7);
              break;
            case "month":
              endDate.setMonth(endDate.getMonth() + value);
              break;
            case "year":
              endDate.setFullYear(endDate.getFullYear() + value);
              break;
          }
          const updatedUser = await User.findByIdAndUpdate(userId, {
            subscription: {
              planId,
              planName,
              startDate,
              endDate,
              status: "active",
              amount: parseFloat(planPrice),
              paymentMethod: "card",
            },
          }, { new: true });
          // Send congratulations email
          sendSubscriptionSuccessEmail(updatedUser, planName).catch(err => console.error("Email error:", err));
          await Plan.findByIdAndUpdate(planId, {
            $inc: { totalSubscribers: 1 },
          });
        } catch (err) {
          console.error("Error activating subscription:", err.message);
        }
      }
    }
    res.json({ received: true });
  },
);

router.get("/verify-session/:sessionId", protect, async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
    );
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed." });
    }
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      planName: session.metadata.planName,
      amount: parseFloat(session.metadata.planPrice),
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
});

// ─── CASH ON VISIT ────────────────────────────────────────────────────────────

// User requests cash payment
router.post("/cash-request", protect, async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: "Plan not found or unavailable." });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: {
          planId: plan._id,
          planName: plan.name,
          startDate: null,
          endDate: null,
          status: "pending",
          amount: plan.price,
          paymentMethod: "cash",
          durationValue: plan.duration.value,
          durationUnit: plan.duration.unit,
        },
      },
      { new: true },
    );
    res.json({
      message:
        "Cash payment request submitted! Visit the gym to pay and activate your membership.",
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: get all pending cash requests
router.get(
  "/pending-cash",
  protect,
  restrictTo("admin"),
  async (req, res, next) => {
    try {
      const users = await User.find({
        "subscription.status": "pending", // ← only filter by status
      }).select("name email subscription createdAt");
      res.json({ users, total: users.length });
    } catch (error) {
      next(error);
    }
  },
);

// Admin: activate a cash subscription after receiving payment
router.post(
  "/activate-cash/:userId",
  protect,
  restrictTo("admin"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      if (user.subscription?.status !== "pending") {
        return res
          .status(400)
          .json({ error: "No pending cash subscription for this user." });
      }
      const startDate = new Date();
      const endDate = new Date();
      const value = user.subscription.durationValue || 1;
      const unit = user.subscription.durationUnit || "month";
      switch (unit) {
        case "day":
          endDate.setDate(endDate.getDate() + value);
          break;
        case "week":
          endDate.setDate(endDate.getDate() + value * 7);
          break;
        case "month":
          endDate.setMonth(endDate.getMonth() + value);
          break;
        case "year":
          endDate.setFullYear(endDate.getFullYear() + value);
          break;
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        {
          "subscription.status": "active",
          "subscription.startDate": startDate,
          "subscription.endDate": endDate,
        },
        { new: true },
      );
      
      // Send the congratulatory email now that the admin has accepted their cash invite
      sendSubscriptionSuccessEmail(updatedUser, updatedUser.subscription.planName).catch(err => console.error("Email error:", err));
      await Plan.findByIdAndUpdate(user.subscription.planId, {
        $inc: { totalSubscribers: 1 },
      });
      res.json({
        message: `Membership activated for ${updatedUser.name}!`,
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Admin: reject/cancel a pending cash request
router.delete(
  "/cancel-cash/:userId",
  protect,
  restrictTo("admin"),
  async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(req.params.userId, {
        subscription: {
          status: "none",
          planId: null,
          planName: null,
          startDate: null,
          endDate: null,
          amount: 0,
        },
      });
      res.json({ message: "Cash request cancelled." });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
