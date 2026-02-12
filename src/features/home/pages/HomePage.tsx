import { AboutSection } from "@/features/home/sections/AboutSection";
import { BookingSection } from "@/features/home/sections/BookingSection";
import { ContactSection } from "@/features/home/sections/ContactSection";
import { FleetSection } from "@/features/home/sections/FleetSection";
import { FooterSection } from "@/features/home/sections/FooterSection";
import { HeaderSection } from "@/features/home/sections/HeaderSection";
import { HeroSection } from "@/features/home/sections/HeroSection";

const HomePage = () => (
  <div className="min-h-screen bg-background">
    <HeaderSection />
    <HeroSection />
    <FleetSection />
    <AboutSection />
    <BookingSection />
    <ContactSection />
    <FooterSection />
  </div>
);

export default HomePage;
