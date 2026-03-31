/**
 * Plan Controller
 * Membership plan CRUD and subscription management
 */

const Plan = require('../models/Plan');
const User = require('../models/User');
const { sendSubscriptionSuccessEmail } = require('../config/email');

/**
 * GET /api/plans
 * Get all active plans (public)
 */
const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.json({ plans });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/plans/:id
 */
const getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.json({ plan });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/plans (admin)
 */
const createPlan = async (req, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ message: 'Plan created.', plan });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/plans/:id (admin)
 */
const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.json({ message: 'Plan updated.', plan });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/plans/:id (admin)
 */
const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.json({ message: 'Plan deactivated.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/plans/:id/subscribe
 * Subscribe current user to a plan
 */
const subscribeToPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: 'Plan not found or unavailable.' });
    }

    const startDate = new Date();
    const endDate = new Date();

    // Calculate end date
    const { value, unit } = plan.duration;
    switch (unit) {
      case 'day': endDate.setDate(endDate.getDate() + value); break;
      case 'week': endDate.setDate(endDate.getDate() + value * 7); break;
      case 'month': endDate.setMonth(endDate.getMonth() + value); break;
      case 'year': endDate.setFullYear(endDate.getFullYear() + value); break;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: {
          planId: plan._id,
          planName: plan.name,
          startDate,
          endDate,
          status: 'active',
          amount: plan.price,
        },
      },
      { new: true }
    );

    // Increment plan subscriber count
    await Plan.findByIdAndUpdate(plan._id, { $inc: { totalSubscribers: 1 } });

    // Send congratulations email
    sendSubscriptionSuccessEmail(req.user || user, plan.name).catch(err => console.error('Subscription email failed:', err));

    res.json({
      message: `Successfully subscribed to ${plan.name}!`,
      subscription: user.subscription,
      expiresAt: endDate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlans, getPlan, createPlan, updatePlan, deletePlan, subscribeToPlan };
