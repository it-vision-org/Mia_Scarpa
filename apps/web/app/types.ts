// ─── Admin backward-compat types (admin pages still use these) ───────────────

export type SizeStock = { size: string; stock: number };

export interface UploadResponse {
  ufsUrl: string;
  url: string;
}

export type ColorImage = {
  name: string;
  hex: string;
  imageUrls: string[];
  sizes: SizeStock[];  // per-color stock per size
};

export type Gender = "MEN" | "WOMEN";

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string[];        // main product photos (product-level)
  colorImages: ColorImage[];
  isPublished: boolean;
  isFeatured: boolean;
  gender: Gender;
  categoryId: string | null;
};

export type ProductInput = {
  name: string;
  priceCents: number;
  images: string[];        // main product photos
  colorImages: ColorImage[];  // each color owns its sizes+stock
  isPublished: boolean;
  isFeatured: boolean;
  gender: Gender;
  categoryId: string | null;
};

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryNode[];
};

// ─── Shared action result ─────────────────────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  address?: string | null;
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export type CartItem = {
  id: string;         // === variantId for backward compat
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  unitPrice: number;  // TND
  colorName: string | null;
  colorHex: string | null;
  size: string | null;
  quantity: number;
  maxStock?: number;
};

// ─── Serialized product types (Decimal → number) ─────────────────────────────

export type SerializedProductColorImage = {
  id: string;
  url: string;
  alt: string | null;
  order: number;
};

export type SerializedProductColorSize = {
  id: string;
  size: string;
  stock: number;
  priceOverride: number | null;
};

export type SerializedProductColor = {
  id: string;
  name: string;
  hex: string | null;
  isActive: boolean;
  images: SerializedProductColorImage[];
  sizes: SerializedProductColorSize[];
};

export type SerializedProductImage = {
  id: string;
  url: string;
  alt: string | null;
  order: number;
};

export type SerializedProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  primaryImage: string | null;  // first main image, for cards
  images: SerializedProductImage[];  // all main product images
  isPublished: boolean;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string } | null;
  colors: SerializedProductColor[];
  createdAt: string;
  updatedAt: string;
};

// ─── Order types ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type SerializedOrderItem = {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  colorName: string;
  size: string;
  productImage: string | null;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
};

export type SerializedOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  city: string | null;
  subtotal: number;
  shippingCost: number;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  total: number;
  status: string;
  notes: string | null;
  userId: string | null;
  items: SerializedOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrdersPage = {
  orders: SerializedOrder[];
  totalCount: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  city?: string;
  items: { variantId: string; quantity: number }[];
};

export type OrderStatistics = {
  total: number;
  totalRevenue: number;
  byStatus: Partial<Record<string, number>>;
};

// ─── Store settings types ─────────────────────────────────────────────────────

export type HeroText = {
  cta1: string;
};

export type CollectionText = { label: string; title: string; desc: string };

export const DEFAULT_COLLECTION: CollectionText = {
  label: "Collection",
  title: "Featured Shoes",
  desc: "Hand-picked pairs from our collection",
};

export type FooterCtaText = { title: string; desc: string; btn: string };

export const DEFAULT_FOOTER_CTA: FooterCtaText = {
  title: "Find your perfect pair.",
  desc: "Browse our full catalog of comfort shoes for every occasion.",
  btn: "Shop All Shoes",
};

export type FeaturedOverlay = { label: string; year: string; collection: string };

export const DEFAULT_FEATURED_OVERLAY: FeaturedOverlay = {
  label: "Collection",
  year: "2025",
  collection: "",
};

export type EditorialBlock = { label: string; title: string; desc: string };

export const DEFAULT_EDITORIAL_1: EditorialBlock = {
  label: "Craftsmanship",
  title: "Made to last",
  desc: "Every pair is built from carefully selected materials, finished by hand for comfort and durability that holds up season after season.",
};

export const DEFAULT_EDITORIAL_2: EditorialBlock = {
  label: "Design",
  title: "Timeless silhouettes",
  desc: "Clean lines and considered proportions, designed to move seamlessly between everyday wear and dressed-up occasions.",
};

export type UspItem = { label: string; desc: string };

export const DEFAULT_USPS: UspItem[] = [
  { label: "Ultra Light", desc: "Feather-light build" },
  { label: "Flexible", desc: "Moves with your foot" },
  { label: "Responsive", desc: "Instant cushioning" },
  { label: "Premium", desc: "Quality materials" },
];

export const DEFAULT_HERO: HeroText = {
  cta1: "Explore",
};

export type StoreUspItem = {
  id: string;
  label: string;
  desc: string;
  order: number;
};

export type SerializedStoreSettings = {
  id: string;
  logoUrl: string | null;
  heroImage: string | null;
  heroCta1: string | null;
  colorAccent: string | null;
  colorGreenDark: string | null;
  colorGreen: string | null;
  colorGreenMid: string | null;
  colorGreenLight: string | null;
  colorGreenBright: string | null;
  videoUrl: string | null;
  shopCoverImage: string | null;
  menCoverImage: string | null;
  womenCoverImage: string | null;
  featuredImage: string | null;
  featuredOverlayLabel: string | null;
  featuredOverlayYear: string | null;
  featuredOverlayCollection: string | null;
  editorialLabel1: string | null;
  editorialTitle1: string | null;
  editorialDesc1: string | null;
  editorialImage1: string | null;
  editorialLabel2: string | null;
  editorialTitle2: string | null;
  editorialDesc2: string | null;
  editorialImage2: string | null;
  collectionLabel: string | null;
  collectionTitle: string | null;
  collectionDesc: string | null;
  footerCtaTitle: string | null;
  footerCtaDesc: string | null;
  footerCtaBtn: string | null;
  deliveryFee: number;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocation: string | null;
  contactResponseTime: string | null;
  usps: StoreUspItem[];
};

export type ContactInfo = {
  email: string;
  phone: string;
  location: string;
  responseTime: string;
};
