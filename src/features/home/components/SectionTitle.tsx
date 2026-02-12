interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description: string;
}

export const SectionTitle = ({ eyebrow, title, description }: SectionTitleProps) => (
  <div className="text-center mb-12 animate-slide-up">
    <p className="text-accent font-medium uppercase tracking-wide mb-2">{eyebrow}</p>
    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{title}</h2>
    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{description}</p>
  </div>
);
