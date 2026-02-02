import { Car } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-accent" />
            <span className="font-heading text-lg font-semibold text-primary-foreground">
              Hemsedal Motors
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#cars" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Our Fleet
            </a>
            <a href="#about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              About Us
            </a>
            <a href="#contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-primary-foreground/60 text-sm">
            © {currentYear} Hemsedal Motors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
