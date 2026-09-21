import dbConnect from "./db";
import Product from "../models/Product";
import User from "../models/User";
import Event from "../models/Event";
import SubscriptionPlan from "../models/SubscriptionPlan";
import LiveStream from "../models/LiveStream";
import bcrypt from "bcryptjs";

const products = [
  {
    name: "Casque Audio Premium",
    description: "Casque sans fil haute fidélité avec réduction de bruit active. Autonomie 30h.",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    category: "Audio",
    stock: 45,
    featured: true,
    productType: "physical",
  },
  {
    name: "Montre Connectée Sport",
    description: "GPS, suivi cardiaque, étanche 50m. Idéale pour le sport.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    category: "Wearables",
    stock: 30,
    featured: true,
    productType: "physical",
  },
  {
    name: "Sac à Dos Urbain",
    description: "Compartiment laptop 15\", USB intégré, design minimaliste.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    category: "Accessoires",
    stock: 60,
    featured: false,
    productType: "physical",
  },
  {
    name: "Single – Midnight Drive (MP3)",
    description: "Single électro-pop exclusif. Écoutez 30 secondes gratuitement, téléchargez avec un abonnement ou à l'unité.",
    price: 1.99,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop",
    category: "Musique",
    stock: 9999,
    featured: true,
    productType: "music",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    previewDuration: 30,
    duration: 210,
    fileSize: "4.8 MB",
    format: "MP3 320kbps",
  },
  {
    name: "EP – Neon Nights (5 titres)",
    description: "EP complet 5 titres. Préécoute 30s. Téléchargement via abonnement ou achat.",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    category: "Musique",
    stock: 9999,
    featured: true,
    productType: "music",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    previewDuration: 30,
    duration: 1200,
    fileSize: "28 MB",
    format: "ZIP MP3",
  },
  {
    name: "Album – Urban Echoes",
    description: "Album 12 titres indie. Préécoute gratuite 45 secondes.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop",
    category: "Musique",
    stock: 9999,
    featured: false,
    productType: "music",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    previewDuration: 45,
    duration: 2800,
    fileSize: "95 MB",
    format: "ZIP FLAC + MP3",
  },
  {
    name: "Masterclass Production Musicale",
    description: "Cours vidéo 2h30 – production électronique de A à Z. Aperçu 60s gratuit.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=600&fit=crop",
    category: "Vidéo",
    stock: 9999,
    featured: true,
    productType: "video",
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewDuration: 60,
    duration: 9000,
    fileSize: "1.2 GB",
    format: "MP4 1080p",
  },
  {
    name: "Clip Officiel – Midnight Drive",
    description: "Clip officiel 4K. Prévisualisation 20 secondes.",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1516280440612-596598898720?w=600&h=600&fit=crop",
    category: "Vidéo",
    stock: 9999,
    featured: false,
    productType: "video",
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    previewDuration: 20,
    duration: 210,
    fileSize: "450 MB",
    format: "MP4 4K",
  },
  {
    name: "Pack Photos Concert Paris 2025",
    description: "50 photos HD exclusives du concert. Téléchargement ZIP après achat.",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1459749411175-04741729efe0?w=600&h=600&fit=crop",
    category: "Photos",
    stock: 9999,
    featured: true,
    productType: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1459749411175-04741729efe0?w=1920",
    fileSize: "180 MB",
    format: "ZIP JPG 4K",
  },
  {
    name: "Pack Photos Studio – Session Neon",
    description: "30 photos studio retouchées, résolution imprimable.",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=600&fit=crop",
    category: "Photos",
    stock: 9999,
    featured: false,
    productType: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920",
    fileSize: "95 MB",
    format: "ZIP JPG",
  },
];

const events = [
  {
    title: "Concert Neon Nights – Paris",
    description: "Soirée électro exclusive avec DJ sets live et visuals immersifs. Ouverture des portes 20h.",
    date: new Date("2026-10-15T20:00:00"),
    endDate: new Date("2026-10-16T02:00:00"),
    location: "Accor Arena",
    city: "Paris",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop",
    ticketPrice: 45,
    category: "concert",
    featured: true,
    capacity: 5000,
  },
  {
    title: "Festival Urban Echoes",
    description: "3 jours de musique indie, hip-hop et électronique. Scènes multiples, food trucks et ateliers.",
    date: new Date("2026-11-05T14:00:00"),
    endDate: new Date("2026-11-07T23:00:00"),
    location: "Parc de la Villette",
    city: "Paris",
    image: "https://images.unsplash.com/photo-1459749411175-04741729efe0?w=800&h=500&fit=crop",
    ticketPrice: 89,
    category: "festival",
    featured: true,
    capacity: 15000,
  },
  {
    title: "Workshop Production Musicale",
    description: "Atelier pratique 1 journée : composition, mixage et mastering avec des pros.",
    date: new Date("2026-10-22T10:00:00"),
    endDate: new Date("2026-10-22T18:00:00"),
    location: "Studio Abbey Road France",
    city: "Lyon",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=500&fit=crop",
    ticketPrice: 120,
    category: "workshop",
    featured: false,
    capacity: 25,
  },
  {
    title: "Meetup Créateurs Digitaux",
    description: "Networking, talks et démos pour artistes, développeurs et designers.",
    date: new Date("2026-10-08T18:30:00"),
    endDate: new Date("2026-10-08T22:00:00"),
    location: "Station F",
    city: "Paris",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
    ticketPrice: 0,
    category: "meetup",
    featured: false,
    capacity: 200,
  },
  {
    title: "Concert Acoustique – Midnight Drive Live",
    description: "Version intimiste acoustique du single Midnight Drive + invités surprise.",
    date: new Date("2026-12-03T21:00:00"),
    endDate: new Date("2026-12-03T23:30:00"),
    location: "Le Trianon",
    city: "Paris",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop",
    ticketPrice: 35,
    category: "concert",
    featured: true,
    capacity: 800,
  },
  {
    title: "Festival d'Hiver – Sound City",
    description: "Grand festival indoor multi-genres. 4 scènes, 40 artistes.",
    date: new Date("2027-01-20T16:00:00"),
    endDate: new Date("2027-01-22T02:00:00"),
    location: "Parc des Expositions",
    city: "Nantes",
    image: "https://images.unsplash.com/photo-1501386761576-eec8f3c2b4c0?w=800&h=500&fit=crop",
    ticketPrice: 75,
    category: "festival",
    featured: false,
    capacity: 12000,
  },
];


const liveStreams = [
  {
    title: "ShopNext Radio – Session Electro",
    description: "DJ set live électro / house. Flux de démonstration en continu.",
    // Public demo MP3 used as continuous-style stream for demo (real Icecast URL in prod)
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=600&fit=crop",
    isLive: true,
    djName: "DJ Neon",
    genre: "Electro / House",
    listeners: 128,
    startedAt: new Date(),
  },
  {
    title: "Late Night Jazz Lounge",
    description: "Ambiance jazz lounge nocturne. Hors antenne – activez depuis l'admin.",
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=600&fit=crop",
    isLive: false,
    djName: "Marie Blue",
    genre: "Jazz",
    listeners: 0,
  },
  {
    title: "Festival Urban Echoes – Live Stage",
    description: "Retransmission live de la scène principale du festival (démo).",
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverImage: "https://images.unsplash.com/photo-1459749411175-04741729efe0?w=1200&h=600&fit=crop",
    isLive: false,
    djName: "Stage A",
    genre: "Festival / Live",
    listeners: 0,
  },
];

const plans = [
  {
    name: "Abonnement Mensuel",
    slug: "monthly",
    description: "Téléchargez tous les morceaux de musique en illimité pendant 30 jours.",
    price: 9.99,
    durationDays: 30,
    features: [
      "Téléchargements musique illimités",
      "Accès à tout le catalogue musical",
      "Nouveautés incluses",
      "Annulation à tout moment",
    ],
    active: true,
  },
  {
    name: "Abonnement Annuel",
    slug: "yearly",
    description: "12 mois d'accès illimité au catalogue musical – 2 mois offerts.",
    price: 99.99,
    durationDays: 365,
    features: [
      "Téléchargements musique illimités",
      "Accès à tout le catalogue musical",
      "Nouveautés incluses",
      "2 mois offerts vs mensuel",
      "Priorité support",
    ],
    active: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    const uri = process.env.MONGODB_URI;
    if (!uri) { console.error("Set MONGODB_URI (Atlas) in .env.local"); process.exit(1); }
    console.log("URI:", uri.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@"));
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    await Product.deleteMany({});
    await User.deleteMany({});
    await Event.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    await LiveStream.deleteMany({});

    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ ${insertedProducts.length} products seeded`);

    const insertedEvents = await Event.insertMany(events);
    console.log(`✅ ${insertedEvents.length} events seeded`);

    const insertedPlans = await SubscriptionPlan.insertMany(plans);
    const insertedLive = await LiveStream.insertMany(liveStreams);
    console.log(`✅ ${insertedLive.length} live streams seeded`);
    console.log(`✅ ${insertedPlans.length} subscription plans seeded`);

    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@shop.com",
      password: hashedPassword,
      role: "admin",
    });

    const userPassword = await bcrypt.hash("user123", 10);
    await User.create({
      name: "Jean Dupont",
      email: "user@shop.com",
      password: userPassword,
      role: "user",
    });

    // Subscriber demo user
    const subPassword = await bcrypt.hash("sub123", 10);
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await User.create({
      name: "Marie Abonnée",
      email: "sub@shop.com",
      password: subPassword,
      role: "user",
      subscriptionPlan: "monthly",
      subscriptionStatus: "active",
      subscriptionStartedAt: new Date(),
      subscriptionExpiresAt: expires,
    });

    console.log("✅ Users seeded:");
    console.log("   admin@shop.com / admin123 (admin)");
    console.log("   user@shop.com  / user123  (user sans abo)");
    console.log("   sub@shop.com   / sub123   (user avec abo mensuel actif)");
    console.log("\n🎉 Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    console.error("\nVérifiez que MongoDB est démarré.");
    process.exit(1);
  }
}

seed();
