import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@trusttaste.com" },
    update: {},
    create: {
      email: "admin@trusttaste.com",
      name: "TrustTaste Admin",
      password: adminPassword,
      role: "ADMIN",
      nationality: "Swiss",
    },
  });
  console.log("Admin created:", admin.email);

  // Create sample owner
  const ownerPassword = await bcrypt.hash("owner123456", 12);
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@goldenfork.ch" },
    update: {},
    create: {
      email: "owner@goldenfork.ch",
      name: "Marco Rossi",
      password: ownerPassword,
      role: "OWNER",
      nationality: "Italian",
    },
  });

  const owner = await prisma.owner.upsert({
    where: { userId: ownerUser.id },
    update: {},
    create: {
      userId: ownerUser.id,
      businessName: "Rossi Hospitality",
    },
  });

  // Create sample places
  const restaurant = await prisma.place.upsert({
    where: { id: "place-golden-fork" },
    update: {},
    create: {
      id: "place-golden-fork",
      name: "The Golden Fork",
      type: "RESTAURANT",
      description: "A cozy Italian restaurant in the heart of Zurich offering authentic pasta, wood-fired pizza, and a curated wine list. Family-friendly atmosphere with great views of the old town.",
      address: "Niederdorfstrasse 12",
      city: "Zurich",
      country: "Switzerland",
      lat: 47.3769,
      lng: 8.5417,
      phone: "+41 44 211 22 33",
      website: "https://goldenfork.ch",
      cuisineType: "Italian",
      priceRange: "MEDIUM",
      openingHours: "Mon-Thu: 11:30–22:00\nFri-Sat: 11:30–23:00\nSun: 12:00–21:00",
      ownerId: owner.id,
      images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format"],
      menuItems: {
        create: [
          { name: "Tagliatelle al Ragù", description: "Handmade pasta with slow-cooked beef ragù", price: 24, category: "Pasta" },
          { name: "Margherita Pizza", description: "San Marzano tomatoes, buffalo mozzarella, fresh basil", price: 18, category: "Pizza" },
          { name: "Risotto ai Funghi", description: "Creamy risotto with mixed wild mushrooms", price: 26, category: "Risotto" },
          { name: "Bruschetta al Pomodoro", description: "Toasted bread with tomatoes and olive oil", price: 10, category: "Starters" },
          { name: "Tiramisù", description: "Classic Italian dessert with mascarpone and espresso", price: 9, category: "Desserts" },
        ],
      },
      beverages: {
        create: [
          { name: "Espresso", price: 4, category: "Coffee" },
          { name: "Cappuccino", price: 5, category: "Coffee" },
          { name: "House Red Wine (glass)", description: "Chianti Classico", price: 8, category: "Wine" },
          { name: "Aperol Spritz", price: 12, category: "Cocktails" },
          { name: "San Pellegrino 500ml", price: 5, category: "Soft Drinks" },
        ],
      },
    },
  });

  const bar = await prisma.place.upsert({
    where: { id: "place-velvet-bar" },
    update: {},
    create: {
      id: "place-velvet-bar",
      name: "Velvet Bar",
      type: "BAR",
      description: "Zurich's trendiest cocktail bar with award-winning mixologists, over 200 whiskeys, and craft beers on tap. Intimate lighting, great music, and a rooftop terrace in summer.",
      address: "Langstrasse 84",
      city: "Zurich",
      country: "Switzerland",
      lat: 47.3800,
      lng: 8.5250,
      phone: "+41 44 333 44 55",
      cuisineType: null,
      priceRange: "EXPENSIVE",
      openingHours: "Mon-Thu: 18:00–02:00\nFri-Sat: 17:00–04:00\nSun: Closed",
      images: ["https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&auto=format"],
      beverages: {
        create: [
          { name: "Old Fashioned", description: "Bourbon, Angostura bitters, orange peel", price: 18, category: "Classics" },
          { name: "Velvet Negroni", description: "Our signature twist on a Negroni", price: 19, category: "Signature" },
          { name: "Craft IPA (0.5L)", description: "Local Swiss craft brew", price: 9, category: "Beer" },
          { name: "Johnnie Walker Black Label", description: "50ml, straight or on the rocks", price: 14, category: "Whisky" },
          { name: "Lemon Ginger Mocktail", price: 8, category: "Non-Alcoholic" },
        ],
      },
    },
  });

  // Create sample customers and reviews
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: "anna.mueller@gmail.com" },
      update: {},
      create: {
        email: "anna.mueller@gmail.com",
        name: "Anna Müller",
        password: await bcrypt.hash("customer123", 12),
        role: "CUSTOMER",
        nationality: "German",
        birthDate: new Date("1990-05-15"),
      },
    }),
    prisma.user.upsert({
      where: { email: "james.smith@gmail.com" },
      update: {},
      create: {
        email: "james.smith@gmail.com",
        name: "James Smith",
        password: await bcrypt.hash("customer123", 12),
        role: "CUSTOMER",
        nationality: "British",
        birthDate: new Date("1985-11-22"),
      },
    }),
    prisma.user.upsert({
      where: { email: "marie.dupont@gmail.com" },
      update: {},
      create: {
        email: "marie.dupont@gmail.com",
        name: "Marie Dupont",
        password: await bcrypt.hash("customer123", 12),
        role: "CUSTOMER",
        nationality: "French",
        birthDate: new Date("1995-03-08"),
      },
    }),
  ]);

  // Add reviews
  await prisma.review.deleteMany({ where: { placeId: restaurant.id } });
  await prisma.review.createMany({
    data: [
      {
        userId: customers[0].id,
        placeId: restaurant.id,
        rating: 5,
        content: "Absolutely fantastic evening at The Golden Fork! The tagliatelle al ragù was perfectly al dente and the sauce was rich and flavourful. Service was attentive without being intrusive. We'll definitely be back!",
        status: "APPROVED",
        aiAnalysis: "Review is relevant, positive, and specific to food quality and service.",
      },
      {
        userId: customers[1].id,
        placeId: restaurant.id,
        rating: 4,
        content: "Great Italian food in a wonderful atmosphere. The Margherita was simple but delicious — you could really taste the quality of the ingredients. Slight wait for a table on Friday night but worth it.",
        status: "APPROVED",
        aiAnalysis: "Review is genuine, mentions specific dishes and relevant observations.",
      },
      {
        userId: customers[2].id,
        placeId: restaurant.id,
        rating: 3,
        content: "Decent restaurant overall. The risotto was good but nothing spectacular. Service was a bit slow during peak hours. Prices are on the higher side for the portion sizes. Nice ambiance though.",
        status: "APPROVED",
        aiAnalysis: "Balanced review with specific and relevant feedback.",
      },
    ],
  });

  await prisma.review.deleteMany({ where: { placeId: bar.id } });
  await prisma.review.createMany({
    data: [
      {
        userId: customers[1].id,
        placeId: bar.id,
        rating: 5,
        content: "Best cocktail bar in Zurich, full stop. The bartenders really know their craft — my Old Fashioned was perfect. Great atmosphere, fantastic music, and the rooftop is stunning in summer. A must-visit!",
        status: "APPROVED",
        aiAnalysis: "Review is highly relevant for a bar — mentions cocktails, atmosphere, music.",
      },
      {
        userId: customers[0].id,
        placeId: bar.id,
        rating: 4,
        content: "Really enjoyed the signature Negroni at Velvet Bar. The space is beautifully designed and the staff are knowledgeable about their spirits. A bit pricey but you're paying for quality. Will return.",
        status: "APPROVED",
        aiAnalysis: "Positive and specific review for a bar. Relevant content.",
      },
    ],
  });

  // Update place stats
  for (const place of [restaurant, bar]) {
    const reviews = await prisma.review.findMany({
      where: { placeId: place.id, status: "APPROVED" },
      select: { rating: true },
    });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / (reviews.length || 1);
    await prisma.place.update({
      where: { id: place.id },
      data: { avgRating: avg, reviewCount: reviews.length },
    });
  }

  console.log("Database seeded successfully!");
  console.log("\nTest accounts:");
  console.log("  Admin:    admin@trusttaste.com / admin123456");
  console.log("  Owner:    owner@goldenfork.ch / owner123456");
  console.log("  Customer: anna.mueller@gmail.com / customer123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
