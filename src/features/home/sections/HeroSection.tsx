import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hemsedal.jpg";
import { SECTION_IDS } from "@/constants/site";
import { scrollToSectionById } from "@/utils/scroll";

export const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    />

    <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

    <div className="relative z-10 container mx-auto px-4 text-center">
      <div className="max-w-4xl mx-auto animate-slide-up">
        <p className="text-primary-foreground/80 text-lg md:text-xl mb-4 font-medium tracking-wide uppercase">
          Premium Car Rental & Sales in Norway
        </p>
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Explore Hemsedal
          <span className="block text-gradient mt-2">In Style</span>
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover the majestic Norwegian mountains with our premium selection of vehicles. Rent for your
          adventure or find your perfect car to own.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => scrollToSectionById(SECTION_IDS.fleet)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 btn-glow"
          >
            View Our Fleet
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSectionById(SECTION_IDS.contact)}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8 py-6"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>

    <button
      onClick={() => scrollToSectionById(SECTION_IDS.fleet)}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 hover:text-primary-foreground transition-colors animate-bounce"
    >
      <ChevronDown className="w-8 h-8" />
    </button>
  </section>
);
