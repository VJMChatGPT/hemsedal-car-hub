import { SECTION_IDS } from "@/constants/site";
import { BookingFlow } from "@/features/home/components/booking/BookingFlow";
import { SectionTitle } from "@/features/home/components/SectionTitle";
import { SiteContentMap, getSiteText } from "@/features/home/content/siteContent";

interface BookingSectionProps {
  content: SiteContentMap;
}

export const BookingSection = ({ content }: BookingSectionProps) => (
  <section id={SECTION_IDS.bookings} className="py-20 bg-muted/30">
    <div className="container mx-auto px-4">
      <SectionTitle
        eyebrow={getSiteText(content, "booking.eyebrow")}
        title={getSiteText(content, "booking.title")}
        description={getSiteText(content, "booking.description")}
      />

      <div className="max-w-3xl mx-auto">
        <BookingFlow />
      </div>
    </div>
  </section>
);
