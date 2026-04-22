import { supabase } from "@/integrations/supabase/client";

export type SiteContentInputType = "text" | "textarea";

export type SiteContentField = {
  key: string;
  section: string;
  label: string;
  value: string;
  inputType: SiteContentInputType;
  sortOrder: number;
};

export type SiteContentMap = Record<string, string>;

export const SITE_CONTENT_FIELDS: SiteContentField[] = [
  { key: "header.nav_fleet", section: "Menu", label: "Enlace flota", value: "Our Fleet", inputType: "text", sortOrder: 10 },
  { key: "header.nav_about", section: "Menu", label: "Enlace sobre nosotros", value: "About Us", inputType: "text", sortOrder: 20 },
  { key: "header.nav_bookings", section: "Menu", label: "Enlace reservas", value: "Reservas", inputType: "text", sortOrder: 30 },
  { key: "header.nav_contact", section: "Menu", label: "Enlace contacto", value: "Contact", inputType: "text", sortOrder: 40 },
  { key: "header.cta", section: "Menu", label: "Boton principal", value: "Book Now", inputType: "text", sortOrder: 50 },

  { key: "hero.eyebrow", section: "Hero", label: "Texto superior", value: "Premium Car Rental & Sales in Norway", inputType: "text", sortOrder: 100 },
  { key: "hero.title_prefix", section: "Hero", label: "Titulo principal", value: "Explore Dal Motorer", inputType: "text", sortOrder: 110 },
  { key: "hero.title_highlight", section: "Hero", label: "Titulo destacado", value: "In Style", inputType: "text", sortOrder: 120 },
  {
    key: "hero.description",
    section: "Hero",
    label: "Descripcion",
    value: "Discover the majestic Norwegian mountains with our premium selection of vehicles. Rent for your adventure or find your perfect car to own.",
    inputType: "textarea",
    sortOrder: 130,
  },
  { key: "hero.primary_cta", section: "Hero", label: "Boton flota", value: "View Our Fleet", inputType: "text", sortOrder: 140 },
  { key: "hero.secondary_cta", section: "Hero", label: "Boton contacto", value: "Contact Us", inputType: "text", sortOrder: 150 },

  { key: "fleet.eyebrow", section: "Flota", label: "Texto superior", value: "Our Premium Selection", inputType: "text", sortOrder: 200 },
  { key: "fleet.title", section: "Flota", label: "Titulo", value: "Choose Your Perfect Ride", inputType: "text", sortOrder: 210 },
  {
    key: "fleet.description",
    section: "Flota",
    label: "Descripcion",
    value: "From luxurious SUVs to eco-friendly electric vehicles, find the ideal car for your Dal Motorer adventure. Rent for your trip or purchase your dream car.",
    inputType: "textarea",
    sortOrder: 220,
  },
  { key: "vehicle.featured_badge", section: "Tarjetas de coches", label: "Etiqueta destacado", value: "Featured", inputType: "text", sortOrder: 230 },
  { key: "vehicle.unavailable_badge", section: "Tarjetas de coches", label: "Etiqueta no disponible", value: "Currently Rented", inputType: "text", sortOrder: 240 },
  { key: "vehicle.seats_label", section: "Tarjetas de coches", label: "Texto plazas", value: "Seats", inputType: "text", sortOrder: 250 },
  { key: "vehicle.rent_per_day", section: "Tarjetas de coches", label: "Precio por dia", value: "Rent per day", inputType: "text", sortOrder: 260 },
  { key: "vehicle.purchase_price", section: "Tarjetas de coches", label: "Precio compra", value: "Purchase price", inputType: "text", sortOrder: 270 },
  { key: "vehicle.rent_button", section: "Tarjetas de coches", label: "Boton alquilar", value: "Rent Now", inputType: "text", sortOrder: 280 },
  { key: "vehicle.buy_button", section: "Tarjetas de coches", label: "Boton comprar", value: "Buy", inputType: "text", sortOrder: 290 },

  { key: "about.eyebrow", section: "Sobre nosotros", label: "Texto superior", value: "Why Choose Us", inputType: "text", sortOrder: 300 },
  { key: "about.title", section: "Sobre nosotros", label: "Titulo", value: "Your Trusted Partner in Dal Motorer", inputType: "text", sortOrder: 310 },
  {
    key: "about.paragraph_1",
    section: "Sobre nosotros",
    label: "Parrafo 1",
    value: "Since 2015, Dal Motorer has been serving visitors and locals with premium vehicle rental and sales. Whether you're here for world-class skiing, summer hiking, or making Dal your home, we have the perfect vehicle for you.",
    inputType: "textarea",
    sortOrder: 320,
  },
  {
    key: "about.paragraph_2",
    section: "Sobre nosotros",
    label: "Parrafo 2",
    value: "Our fleet is specially curated for Norwegian conditions - all vehicles are winter-ready with quality tires and equipped for mountain adventures.",
    inputType: "textarea",
    sortOrder: 330,
  },
  { key: "about.feature_1_title", section: "Ventajas", label: "Ventaja 1 titulo", value: "Fully Insured", inputType: "text", sortOrder: 340 },
  { key: "about.feature_1_description", section: "Ventajas", label: "Ventaja 1 descripcion", value: "All our vehicles come with comprehensive insurance coverage for your peace of mind.", inputType: "textarea", sortOrder: 350 },
  { key: "about.feature_2_title", section: "Ventajas", label: "Ventaja 2 titulo", value: "24/7 Support", inputType: "text", sortOrder: 360 },
  { key: "about.feature_2_description", section: "Ventajas", label: "Ventaja 2 descripcion", value: "Round-the-clock assistance available for any issues during your rental period.", inputType: "textarea", sortOrder: 370 },
  { key: "about.feature_3_title", section: "Ventajas", label: "Ventaja 3 titulo", value: "Local Experts", inputType: "text", sortOrder: 380 },
  { key: "about.feature_3_description", section: "Ventajas", label: "Ventaja 3 descripcion", value: "We know Dal inside out and can recommend the best routes and destinations.", inputType: "textarea", sortOrder: 390 },
  { key: "about.feature_4_title", section: "Ventajas", label: "Ventaja 4 titulo", value: "Premium Quality", inputType: "text", sortOrder: 400 },
  { key: "about.feature_4_description", section: "Ventajas", label: "Ventaja 4 descripcion", value: "Every car in our fleet is meticulously maintained to the highest standards.", inputType: "textarea", sortOrder: 410 },

  { key: "booking.eyebrow", section: "Reservas", label: "Texto superior", value: "Reservas", inputType: "text", sortOrder: 500 },
  { key: "booking.title", section: "Reservas", label: "Titulo", value: "Reserva Tu Vehiculo", inputType: "text", sortOrder: 510 },
  { key: "booking.description", section: "Reservas", label: "Descripcion", value: "Elige tus fechas, revisa los coches disponibles y confirma tu reserva en 3 pasos.", inputType: "textarea", sortOrder: 520 },

  { key: "contact.eyebrow", section: "Contacto", label: "Texto superior", value: "Get In Touch", inputType: "text", sortOrder: 600 },
  { key: "contact.title", section: "Contacto", label: "Titulo", value: "Ready to Hit the Road?", inputType: "text", sortOrder: 610 },
  { key: "contact.description", section: "Contacto", label: "Descripcion", value: "Contact us to book your vehicle or get more information about our rental and sales options. We're here to help!", inputType: "textarea", sortOrder: 620 },
  { key: "contact.info_title", section: "Contacto", label: "Titulo informacion", value: "Contact Information", inputType: "text", sortOrder: 630 },
  { key: "contact.address_label", section: "Contacto", label: "Etiqueta direccion", value: "Address", inputType: "text", sortOrder: 640 },
  { key: "contact.phone_label", section: "Contacto", label: "Etiqueta telefono", value: "Phone", inputType: "text", sortOrder: 650 },
  { key: "contact.email_label", section: "Contacto", label: "Etiqueta email", value: "Email", inputType: "text", sortOrder: 660 },
  { key: "contact.hours_label", section: "Contacto", label: "Etiqueta horario", value: "Opening Hours", inputType: "text", sortOrder: 670 },
  { key: "contact.map_text", section: "Contacto", label: "Texto mapa", value: "Located in the heart of Dal", inputType: "text", sortOrder: 680 },
  { key: "contact.form_title", section: "Formulario contacto", label: "Titulo formulario", value: "Send Us a Message", inputType: "text", sortOrder: 690 },
  { key: "contact.name_label", section: "Formulario contacto", label: "Etiqueta nombre", value: "Your Name", inputType: "text", sortOrder: 700 },
  { key: "contact.name_placeholder", section: "Formulario contacto", label: "Placeholder nombre", value: "Enter your name", inputType: "text", sortOrder: 710 },
  { key: "contact.email_form_label", section: "Formulario contacto", label: "Etiqueta email", value: "Email Address", inputType: "text", sortOrder: 720 },
  { key: "contact.email_placeholder", section: "Formulario contacto", label: "Placeholder email", value: "Enter your email", inputType: "text", sortOrder: 730 },
  { key: "contact.phone_form_label", section: "Formulario contacto", label: "Etiqueta telefono", value: "Phone Number", inputType: "text", sortOrder: 740 },
  { key: "contact.phone_placeholder", section: "Formulario contacto", label: "Placeholder telefono", value: "+47 000 00 000", inputType: "text", sortOrder: 750 },
  { key: "contact.message_label", section: "Formulario contacto", label: "Etiqueta mensaje", value: "Message", inputType: "text", sortOrder: 760 },
  { key: "contact.message_placeholder", section: "Formulario contacto", label: "Placeholder mensaje", value: "Tell us which car you're interested in, preferred dates, or any questions...", inputType: "textarea", sortOrder: 770 },
  { key: "contact.submit_button", section: "Formulario contacto", label: "Boton enviar", value: "Send Message", inputType: "text", sortOrder: 780 },
  { key: "contact.success_message", section: "Formulario contacto", label: "Mensaje enviado", value: "Thank you! We'll get back to you within 24 hours.", inputType: "text", sortOrder: 790 },

  { key: "footer.nav_fleet", section: "Footer", label: "Enlace flota", value: "Our Fleet", inputType: "text", sortOrder: 800 },
  { key: "footer.nav_about", section: "Footer", label: "Enlace sobre nosotros", value: "About Us", inputType: "text", sortOrder: 810 },
  { key: "footer.nav_contact", section: "Footer", label: "Enlace contacto", value: "Contact", inputType: "text", sortOrder: 820 },
  { key: "footer.rights", section: "Footer", label: "Texto derechos", value: "All rights reserved.", inputType: "text", sortOrder: 830 },
];

export const DEFAULT_SITE_CONTENT = SITE_CONTENT_FIELDS.reduce<SiteContentMap>((content, field) => {
  content[field.key] = field.value;
  return content;
}, {});

export const getSiteText = (content: SiteContentMap, key: string) => content[key] ?? DEFAULT_SITE_CONTENT[key] ?? "";

export const fetchSiteContent = async () => {
  const { data, error } = await supabase.from("site_content").select("key,value");

  if (error) {
    console.error("No se pudieron cargar los textos de la home", error);
    return DEFAULT_SITE_CONTENT;
  }

  return (data ?? []).reduce<SiteContentMap>(
    (content, row: { key: string; value: string | null }) => {
      content[row.key] = row.value ?? "";
      return content;
    },
    { ...DEFAULT_SITE_CONTENT },
  );
};

export const mergeContentFields = (content: SiteContentMap) =>
  SITE_CONTENT_FIELDS.map((field) => ({
    ...field,
    value: content[field.key] ?? field.value,
  }));
