import { useEffect, useState } from "react";
import { AboutSection } from "@/features/home/sections/AboutSection";
import { BookingSection } from "@/features/home/sections/BookingSection";
import { ContactSection } from "@/features/home/sections/ContactSection";
import { FleetSection } from "@/features/home/sections/FleetSection";
import { FooterSection } from "@/features/home/sections/FooterSection";
import { HeaderSection } from "@/features/home/sections/HeaderSection";
import { HeroSection } from "@/features/home/sections/HeroSection";
import { DEFAULT_SITE_CONTENT, SiteContentMap, fetchSiteContent } from "@/features/home/content/siteContent";

const HomePage = () => {
  const [content, setContent] = useState<SiteContentMap>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    let isMounted = true;

    fetchSiteContent().then((siteContent) => {
      if (isMounted) {
        setContent(siteContent);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeaderSection content={content} />
      <HeroSection content={content} />
      <FleetSection content={content} />
      <AboutSection content={content} />
      <BookingSection content={content} />
      <ContactSection content={content} />
      <FooterSection content={content} />
    </div>
  );
};

export default HomePage;
