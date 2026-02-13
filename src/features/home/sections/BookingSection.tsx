import { SECTION_IDS } from "@/constants/site";
import { BookingFlow } from "@/features/home/components/booking/BookingFlow";
import { SectionTitle } from "@/features/home/components/SectionTitle";

export const BookingSection = () => (
  <section id={SECTION_IDS.bookings} className="py-20 bg-muted/30">
    <div className="container mx-auto px-4">
      <SectionTitle
        eyebrow="Reservas"
        title="Reserva Tu Vehículo"
        description="Elige tus fechas, revisa los coches disponibles y confirma tu reserva en 3 pasos."
      />

      <div className="max-w-3xl mx-auto">
        <BookingFlow />
      </div>
    </div>
  </section>
);
