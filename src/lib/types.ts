export type Rarity = "common" | "rare" | "epic" | "legendary" | "ultrarare";
export type TierId = "regular" | "medium" | "premium";

export interface TierContents {
  books: number;
  cards: number;
  bookmarks: number;
  artprints?: number;
  surprises: number;
  collectibles?: number;
  bonusChance: number;
  collectibleChance: number;
}

export interface Tier {
  id: TierId;
  name: string;
  price: number;
  tag: string;
  popular?: boolean;
  color: string;
  desc: string;
  contents: TierContents;
  odds: Record<Rarity, number>;
}

export type FigureCategory =
  | "deity"
  | "sacred"
  | "mythological"
  | "cultural"
  | "historical";

export interface Character {
  id: string;
  name: string;
  tradition: string;
  category: FigureCategory;
  emoji: string;
  rarity: Rarity;
  desc: string;
  symbols: string[];
  storyIds: string[];
  stock?: number;
}

export interface Story {
  id: string;
  title: string;
  charIds: string[];
  tradition: string;
  pages: number;
  blurb: string;
  body: string;
}

export type CardKind = "character" | "art" | "wish";

export interface CardItem {
  id: string;
  name: string;
  kind: CardKind;
  charId: string | null;
  rarity: Rarity;
  stock: number;
  tiers: TierId[];
  msg: string;
  sealedRarity?: Rarity;
  bonus?: boolean;
}

export type ProductType =
  | "book"
  | "bookmark"
  | "ministory"
  | "artprint"
  | "collectible"
  | "surprise"
  | "limited"
  | "bonus";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  rarity: Rarity;
  stock: number;
  tiers: TierId[];
  price: number;
  desc: string;
  sealedRarity?: Rarity;
  bonus?: boolean;
}

export interface SealedBox {
  character: Character;
  story: Story;
  cards: CardItem[];
  products: Product[];
  estValue: number;
  topHit: { name: string; rarity: Rarity } | null;
  sealedAt: string;
  seed: number;
}

export type OrderStatus = "paid" | "packing" | "shipped" | "delivered";

export interface Order {
  id: string;
  userId: string;
  tier: TierId;
  price: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
  last4: string;
  box: SealedBox;
  wishText: string;
  revealed: boolean;
}

export type WishStatus = "pending" | "approved" | "declined";

export interface Wish {
  id: string;
  orderId: string;
  userId: string;
  text: string;
  status: WishStatus;
  note: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  pass: string;
  role: "customer" | "admin";
  address: string;
  joined: string;
}

export interface LiveDrop {
  who: string;
  what: string;
  rarity: Rarity;
}

export interface DB {
  users: User[];
  session: string | null;
  orders: Order[];
  wishes: Wish[];
  tiers: Record<TierId, Tier>;
  characters: Character[];
  stories: Story[];
  cards: CardItem[];
  products: Product[];
  stock: Record<string, number>;
  live: LiveDrop[];
}

export const RARITY_ORDER: Rarity[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "ultrarare",
];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  ultrarare: "Ultra Rare",
};
