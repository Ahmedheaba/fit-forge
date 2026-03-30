const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, updateUser, getAllBookings, updateBooking } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin')); // All admin routes

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id', updateBooking);

module.exports = router;
