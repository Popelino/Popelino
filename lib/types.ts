import type { Place, Review, User, Owner, PlaceType, ReviewStatus, PriceRange } from "@prisma/client";

export type PlaceWithDetails = Place & {
  reviews: (Review & { user: Pick<User, "id" | "name" | "avatar" | "nationality"> })[];
  owner: (Owner & { user: Pick<User, "name" | "email"> }) | null;
  menuItems: import("@prisma/client").MenuItem[];
  beverages: import("@prisma/client").Beverage[];
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "avatar" | "nationality" | "birthDate">;
};

export type PlaceCard = Pick<
  Place,
  "id" | "name" | "type" | "address" | "city" | "country" | "lat" | "lng" | "images" | "avgRating" | "reviewCount" | "priceRange" | "cuisineType"
>;

export { PlaceType, ReviewStatus, PriceRange };
