// ─── routes/plans.js ──────────────────────────────────────────────────────────
const express = require('express');
const planRouter = express.Router();
const { getPlans, getPlan, createPlan, updatePlan, deletePlan, subscribeToPlan } = require('../controllers/planController');
const { protect, restrictTo } = require('../middleware/auth');

planRouter.get('/', getPlans);
planRouter.get('/:id', getPlan);
planRouter.post('/', protect, restrictTo('admin'), createPlan);
planRouter.put('/:id', protect, restrictTo('admin'), updatePlan);
planRouter.delete('/:id', protect, restrictTo('admin'), deletePlan);
planRouter.post('/:id/subscribe', protect, subscribeToPlan);

module.exports = planRouter;
