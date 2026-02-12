import { Car } from "lucide-react";
import { SECTION_IDS, SITE_CONFIG } from "@/constants/site";

const footerLinks = [
  { label: "Our Fleet", href: `#${SECTION_IDS.fleet}` },
  { label: "About Us", href: `#${SECTION_IDS.about}` },
  { label: "Contact", href: `#${SECTION_IDS.contact}` },
] as const;

export const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-accent" />
            <span className="font-heading text-lg font-semibold text-primary-foreground">{SITE_CONFIG.brandName}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-primary-foreground/60 text-sm">© {currentYear} {SITE_CONFIG.brandName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
