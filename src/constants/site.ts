export const SITE_NAME = "Dal Motorer";
export const SITE_SLUG = "dalmotorer";

export const SITE_CONFIG = {
  brandName: SITE_NAME,
  phone: "+47 123 45 678",
  email: `kontakt@${SITE_SLUG}.no`,
  address: {
    street: "Dalsvegen 123",
    city: "3560 Dal, Norway",
  },
  openingHours: {
    weekdays: "Mon - Fri: 08:00 - 18:00",
    weekend: "Sat - Sun: 10:00 - 16:00",
  },
} as const;

export const SECTION_IDS = {
  fleet: "cars",
  about: "about",
  bookings: "bookings",
  contact: "contact",
} as const;

export const APP_ROUTES = {
  home: "/",
  adminLogin: "/admin/login",
  admin: "/admin",
  fallback: "*",
} as const;
