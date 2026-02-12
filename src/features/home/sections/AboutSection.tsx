import { SECTION_IDS } from "@/constants/site";
import { SectionTitle } from "@/features/home/components/SectionTitle";
import { COMPANY_FEATURES } from "@/features/home/data/features";

export const AboutSection = () => (
  <section id={SECTION_IDS.about} className="py-20 bg-secondary">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-slide-up">
          <p className="text-accent font-medium uppercase tracking-wide mb-2">Why Choose Us</p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Trusted Partner in Hemsedal
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Since 2015, Hemsedal Motors has been serving visitors and locals with premium vehicle rental and
            sales. Whether you're here for world-class skiing, summer hiking, or making Hemsedal your home, we
            have the perfect vehicle for you.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our fleet is specially curated for Norwegian conditions — all vehicles are winter-ready with quality
            tires and equipped for mountain adventures.
          </p>
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
              <h3 className="font-heading text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
