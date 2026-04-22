import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dalmotorer.jpg";
import { SECTION_IDS } from "@/constants/site";
import { SiteContentMap, getSiteText } from "@/features/home/content/siteContent";
import { scrollToSectionById } from "@/utils/scroll";

interface HeroSectionProps {
  content: SiteContentMap;
}

export const HeroSection = ({ content }: HeroSectionProps) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    />

    <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

    <div className="relative z-10 container mx-auto px-4 text-center">
      <div className="max-w-4xl mx-auto animate-slide-up">
        <p className="text-primary-foreground/80 text-lg md:text-xl mb-4 font-medium tracking-wide uppercase">
          {getSiteText(content, "hero.eyebrow")}
        </p>
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          {getSiteText(content, "hero.title_prefix")}
          <span className="block text-gradient mt-2">{getSiteText(content, "hero.title_highlight")}</span>
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          {getSiteText(content, "hero.description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => scrollToSectionById(SECTION_IDS.fleet)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 btn-glow"
          >
            {getSiteText(content, "hero.primary_cta")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSectionById(SECTION_IDS.contact)}
            className="border-primary-foreground bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-lg px-8 py-6"
          >
            {getSiteText(content, "hero.secondary_cta")}
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
