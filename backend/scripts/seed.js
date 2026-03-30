/**
 * Database Seed Script
 * Run: node scripts/seed.js
 * Populates DB with sample plans, classes, and admin user
 */

require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const Plan = require("../models/Plan");
const GymClass = require("../models/GymClass");
const User = require("../models/User");

const MONGODB_URI = `mongodb+srv://ahmedheaba1911_db_user:qLOZkuEz4GHL4PHZ@cluster0.fwafuza.mongodb.net/GYM-APP?retryWrites=true&w=majority`;

const plans = [
  {
    name: "Starter",
    description: "Perfect for beginners starting their fitness journey.",
    price: 29,
    duration: { value: 1, unit: "month" },
    category: "basic",
    maxBookingsPerMonth: 8,
    isPopular: false,
    color: "#888888",
    features: [
      "Access to main gym floor",
      "8 class bookings per month",
      "Locker room access",
      "Basic fitness assessment",
      "Mobile app access",
    ],
  },
  {
    name: "Pro",
    description: "Our most popular plan for serious fitness enthusiasts.",
    price: 59,
    duration: { value: 1, unit: "month" },
    category: "standard",
    maxBookingsPerMonth: null,
    isPopular: true,
    color: "#39FF14",
    features: [
      "Unlimited gym access",
      "Unlimited class bookings",
      "All group classes included",
      "Monthly progress check-in",
      "Nutrition guidance",
      "Guest pass (2/month)",
      "Priority booking",
    ],
  },
  {
    name: "Elite Annual",
    description: "Maximum value for the committed athlete. Save 40%.",
    price: 399,
    duration: { value: 1, unit: "year" },
    category: "premium",
    maxBookingsPerMonth: null,
    isPopular: false,
    color: "#FF6B00",
    features: [
      "Everything in Pro",
      "Annual savings of $309",
      "2 Personal training sessions/month",
      "Body composition analysis",
      "Dedicated account manager",
      "Unlimited guest passes",
      "Spa & recovery suite access",
      "Exclusive member events",
    ],
  },
  {
    name: "Personal Training",
    description: "One-on-one coaching tailored to your specific goals.",
    price: 149,
    duration: { value: 1, unit: "month" },
    category: "personal_training",
    maxBookingsPerMonth: null,
    isPopular: false,
    color: "#9B59B6",
    features: [
      "8 personal training sessions/month",
      "Custom workout program",
      "Custom nutrition plan",
      "Weekly progress tracking",
      "Unlimited gym access",
      "Priority scheduling",
      "Direct trainer messaging",
      "Video form reviews",
    ],
  },
];

const gymClasses = [
  {
    name: "Morning HIIT Blast",
    description:
      "High-intensity interval training to kickstart your metabolism. Burn up to 600 calories in this fast-paced, energizing session.",
    category: "hiit",
    trainer: { name: "Marcus Williams", avatar: null },
    duration: 45,
    maxCapacity: 20,
    difficulty: "intermediate",
    room: "Studio A",
    color: "#FF4444",
    schedule: [
      { dayOfWeek: 1, startTime: "06:00" },
      { dayOfWeek: 3, startTime: "06:00" },
      { dayOfWeek: 5, startTime: "06:00" },
      { dayOfWeek: 1, startTime: "18:00" },
      { dayOfWeek: 3, startTime: "18:00" },
    ],
  },
  {
    name: "Power Yoga Flow",
    description:
      "Dynamic yoga combining strength, flexibility, and mindfulness. Suitable for all experience levels.",
    category: "yoga",
    trainer: { name: "Sophia Chen", avatar: null },
    duration: 60,
    maxCapacity: 15,
    difficulty: "all_levels",
    room: "Mind & Body Studio",
    color: "#9B59B6",
    schedule: [
      { dayOfWeek: 2, startTime: "07:30" },
      { dayOfWeek: 4, startTime: "07:30" },
      { dayOfWeek: 6, startTime: "09:00" },
      { dayOfWeek: 0, startTime: "10:00" },
    ],
  },
  {
    name: "CrossFit WOD",
    description:
      "Workout of the Day — constantly varied functional movements performed at high intensity.",
    category: "crossfit",
    trainer: { name: "Jake Rodriguez", avatar: null },
    duration: 60,
    maxCapacity: 16,
    difficulty: "advanced",
    room: "CrossFit Box",
    color: "#FF6B00",
    schedule: [
      { dayOfWeek: 1, startTime: "07:00" },
      { dayOfWeek: 2, startTime: "07:00" },
      { dayOfWeek: 3, startTime: "07:00" },
      { dayOfWeek: 4, startTime: "07:00" },
      { dayOfWeek: 5, startTime: "07:00" },
      { dayOfWeek: 1, startTime: "19:00" },
      { dayOfWeek: 3, startTime: "19:00" },
      { dayOfWeek: 5, startTime: "19:00" },
    ],
  },
  {
    name: "Spin Cycle",
    description:
      "High-energy indoor cycling with motivating music and an expert instructor to push your limits.",
    category: "cycling",
    trainer: { name: "Aisha Johnson", avatar: null },
    duration: 45,
    maxCapacity: 25,
    difficulty: "all_levels",
    room: "Cycling Studio",
    color: "#39FF14",
    schedule: [
      { dayOfWeek: 1, startTime: "06:30" },
      { dayOfWeek: 2, startTime: "17:30" },
      { dayOfWeek: 3, startTime: "06:30" },
      { dayOfWeek: 4, startTime: "17:30" },
      { dayOfWeek: 5, startTime: "06:30" },
      { dayOfWeek: 6, startTime: "08:00" },
    ],
  },
  {
    name: "Boxing Fundamentals",
    description:
      "Learn proper boxing technique, footwork, and combinations. Great for fitness and self-defense.",
    category: "boxing",
    trainer: { name: 'Derek "The Tank" Thompson', avatar: null },
    duration: 60,
    maxCapacity: 12,
    difficulty: "beginner",
    room: "Boxing Ring",
    color: "#E74C3C",
    schedule: [
      { dayOfWeek: 2, startTime: "18:00" },
      { dayOfWeek: 4, startTime: "18:00" },
      { dayOfWeek: 6, startTime: "10:00" },
    ],
  },
  {
    name: "Strength & Conditioning",
    description:
      "Build functional strength using barbells, dumbbells, and bodyweight. Progressive programming for real results.",
    category: "strength",
    trainer: { name: "Marcus Williams", avatar: null },
    duration: 75,
    maxCapacity: 10,
    difficulty: "intermediate",
    room: "Weight Room",
    color: "#3498DB",
    schedule: [
      { dayOfWeek: 1, startTime: "09:00" },
      { dayOfWeek: 3, startTime: "09:00" },
      { dayOfWeek: 5, startTime: "09:00" },
      { dayOfWeek: 2, startTime: "19:00" },
      { dayOfWeek: 4, startTime: "19:00" },
    ],
  },
  {
    name: "Pilates Core",
    description:
      "Strengthen your core, improve posture, and increase body awareness through controlled Pilates movements.",
    category: "pilates",
    trainer: { name: "Sophia Chen", avatar: null },
    duration: 55,
    maxCapacity: 12,
    difficulty: "all_levels",
    room: "Mind & Body Studio",
    color: "#1ABC9C",
    schedule: [
      { dayOfWeek: 1, startTime: "11:00" },
      { dayOfWeek: 3, startTime: "11:00" },
      { dayOfWeek: 5, startTime: "11:00" },
      { dayOfWeek: 0, startTime: "11:00" },
    ],
  },
  {
    name: "Cardio Kickboxing",
    description:
      "Combine cardio and martial arts moves for a full-body workout that improves coordination and burns fat.",
    category: "cardio",
    trainer: { name: "Aisha Johnson", avatar: null },
    duration: 50,
    maxCapacity: 20,
    difficulty: "intermediate",
    room: "Studio A",
    color: "#F39C12",
    schedule: [
      { dayOfWeek: 2, startTime: "12:00" },
      { dayOfWeek: 4, startTime: "12:00" },
      { dayOfWeek: 6, startTime: "11:00" },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([Plan.deleteMany({}), GymClass.deleteMany({})]);
    console.log("🗑️  Cleared existing plans and classes");

    // Seed plans
    const createdPlans = await Plan.insertMany(plans);
    console.log(`✅ Created ${createdPlans.length} plans`);

    // Seed classes
    const createdClasses = await GymClass.insertMany(gymClasses);
    console.log(`✅ Created ${createdClasses.length} gym classes`);

    // Create admin user if doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || "admin@fitforge.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "FitForge Admin",
        email: "admin@fitforge.com",
        password: "Admin@123",
        role: "admin",
      });
      console.log(`✅ Admin user created: ${adminEmail} / Admin@123`);
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log("─────────────────────────────────");
    console.log(`Plans: ${createdPlans.length}`);
    console.log(`Classes: ${createdClasses.length}`);
    console.log("─────────────────────────────────");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
