require("dotenv").config();
const mongoose = require("mongoose");

const plans = [
  {
    name: "Starter",
    slug: "starter",
    description: "Perfect for beginners starting their fitness journey.",
    price: 29,
    duration: { value: 1, unit: "month" },
    category: "basic",
    maxBookingsPerMonth: 8,
    isPopular: false,
    isActive: true,
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
    slug: "pro",
    description: "Our most popular plan for serious fitness enthusiasts.",
    price: 59,
    duration: { value: 1, unit: "month" },
    category: "standard",
    maxBookingsPerMonth: null,
    isPopular: true,
    isActive: true,
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
    slug: "elite-annual",
    description: "Maximum value for the committed athlete. Save 40%.",
    price: 399,
    duration: { value: 1, unit: "year" },
    category: "premium",
    maxBookingsPerMonth: null,
    isPopular: false,
    isActive: true,
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
    slug: "personal-training",
    description: "One-on-one coaching tailored to your specific goals.",
    price: 149,
    duration: { value: 1, unit: "month" },
    category: "personal_training",
    maxBookingsPerMonth: null,
    isPopular: false,
    isActive: true,
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

async function fixPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Drop the entire plans collection to clear bad indexes
    const collections = await mongoose.connection.db
      .listCollections({ name: "plans" })
      .toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.dropCollection("plans");
      console.log("🗑️  Dropped plans collection (clears bad indexes too)");
    }

    // Recreate using raw insert to avoid model index issues
    const db = mongoose.connection.db;
    const result = await db.collection("plans").insertMany(
      plans.map((p) => ({
        ...p,
        totalSubscribers: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    console.log(`✅ Created ${result.insertedCount} plans:`);
    plans.forEach((p, i) => {
      console.log(`   - ${p.name} | $${p.price} | slug: ${p.slug}`);
    });
  } catch (err) {
    console.log("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Done!");
  }
}

fixPlans();
