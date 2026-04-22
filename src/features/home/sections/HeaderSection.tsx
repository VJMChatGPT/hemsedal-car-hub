import { Car, Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SECTION_IDS, SITE_CONFIG } from "@/constants/site";
import { SiteContentMap, getSiteText } from "@/features/home/content/siteContent";
import { scrollToSectionById } from "@/utils/scroll";

interface HeaderSectionProps {
  content: SiteContentMap;
}

export const HeaderSection = ({ content }: HeaderSectionProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: getSiteText(content, "header.nav_fleet"), sectionId: SECTION_IDS.fleet },
    { label: getSiteText(content, "header.nav_about"), sectionId: SECTION_IDS.about },
    { label: getSiteText(content, "header.nav_bookings"), sectionId: SECTION_IDS.bookings },
    { label: getSiteText(content, "header.nav_contact"), sectionId: SECTION_IDS.contact },
  ] as const;

  const handleNavigate = (sectionId: string) => {
    scrollToSectionById(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-accent" />
            <span className="font-heading text-xl font-semibold text-foreground">{SITE_CONFIG.brandName}</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <button
                key={item.sectionId}
                onClick={() => handleNavigate(item.sectionId)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}

            <Button
              onClick={() => handleNavigate(SECTION_IDS.bookings)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <Phone className="w-4 h-4 mr-2" />
              {getSiteText(content, "header.cta")}
            </Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen((prev) => !prev)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navigationItems.map((item) => (
                <button
                  key={item.sectionId}
                  onClick={() => handleNavigate(item.sectionId)}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                >
                  {item.label}
                </button>
              ))}

              <Button
                onClick={() => handleNavigate(SECTION_IDS.bookings)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                {getSiteText(content, "header.cta")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
