const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getBooking,
  cancelBooking, getAvailability,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All booking routes require auth

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/availability/:classId', getAvailability);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
