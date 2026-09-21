export type ProductType = "physical" | "music" | "video" | "photo" | "digital";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  productType: ProductType;
  mediaUrl?: string;
  previewUrl?: string;
  previewDuration?: number;
  duration?: number;
  fileSize?: string;
  format?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  subscriptionPlan?: "none" | "monthly" | "yearly";
  subscriptionStatus?: "active" | "expired" | "cancelled" | "none";
  subscriptionExpiresAt?: string;
  subscriptionStartedAt?: string;
  createdAt?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name?: string; email?: string };
  items: {
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    productType?: ProductType;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "paid";
  paymentMethod?: "paypal" | "card" | "none" | "subscription";
  paypalOrderId?: string;
  shippingAddress: ShippingAddress;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: "user" | "admin";
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  city: string;
  image: string;
  ticketPrice: number;
  ticketUrl?: string;
  category: "concert" | "festival" | "meetup" | "workshop" | "other";
  featured: boolean;
  capacity?: number;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  slug: "monthly" | "yearly";
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  active: boolean;
}


export interface LiveStream {
  _id: string;
  title: string;
  description: string;
  streamUrl: string;
  coverImage: string;
  isLive: boolean;
  djName?: string;
  genre?: string;
  listeners?: number;
  startedAt?: string;
  createdAt?: string;
}
