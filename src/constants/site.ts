export const SITE_CONFIG = {
  brandName: "Hemsedal Motors",
  phone: "+47 123 45 678",
  email: "kontakt@hemsedalmotors.no",
  address: {
    street: "Hemsedalsvegen 123",
    city: "3560 Hemsedal, Norway",
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
  fallback: "*",
} as const;
