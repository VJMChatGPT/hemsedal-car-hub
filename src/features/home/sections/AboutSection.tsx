import { SECTION_IDS } from "@/constants/site";
import { SiteContentMap, getSiteText } from "@/features/home/content/siteContent";
import { COMPANY_FEATURES } from "@/features/home/data/features";

interface AboutSectionProps {
  content: SiteContentMap;
}

export const AboutSection = ({ content }: AboutSectionProps) => (
  <section id={SECTION_IDS.about} className="py-20 bg-secondary">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-slide-up">
          <p className="text-accent font-medium uppercase tracking-wide mb-2">{getSiteText(content, "about.eyebrow")}</p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {getSiteText(content, "about.title")}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{getSiteText(content, "about.paragraph_1")}</p>
          <p className="text-muted-foreground text-lg leading-relaxed">{getSiteText(content, "about.paragraph_2")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {COMPANY_FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card p-6 rounded-xl border border-border card-hover animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-card-foreground mb-2">
                {getSiteText(content, `about.feature_${index + 1}_title`)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {getSiteText(content, `about.feature_${index + 1}_description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
