import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_IDS, SITE_CONFIG } from "@/constants/site";
import { SectionTitle } from "@/features/home/components/SectionTitle";
import { SiteContentMap, getSiteText } from "@/features/home/content/siteContent";
import { useFormFields } from "@/features/home/hooks/useFormFields";
import { ContactFormValues } from "@/features/home/types/home";

const initialContactValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

interface ContactSectionProps {
  content: SiteContentMap;
}

export const ContactSection = ({ content }: ContactSectionProps) => {
  const { values, onFieldChange, resetValues } = useFormFields(initialContactValues);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(getSiteText(content, "contact.success_message"));
    resetValues();
  };

  return (
    <section id={SECTION_IDS.contact} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow={getSiteText(content, "contact.eyebrow")}
          title={getSiteText(content, "contact.title")}
          description={getSiteText(content, "contact.description")}
        />

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8 animate-slide-up">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="font-heading text-xl font-semibold text-card-foreground mb-6">{getSiteText(content, "contact.info_title")}</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{getSiteText(content, "contact.address_label")}</p>
                    <p className="text-muted-foreground">
                      {SITE_CONFIG.address.street}
                      <br />
                      {SITE_CONFIG.address.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{getSiteText(content, "contact.phone_label")}</p>
                    <p className="text-muted-foreground">{SITE_CONFIG.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{getSiteText(content, "contact.email_label")}</p>
                    <p className="text-muted-foreground">{SITE_CONFIG.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{getSiteText(content, "contact.hours_label")}</p>
                    <p className="text-muted-foreground">
                      {SITE_CONFIG.openingHours.weekdays}
                      <br />
                      {SITE_CONFIG.openingHours.weekend}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-xl h-48 flex items-center justify-center">
              <p className="text-muted-foreground">{getSiteText(content, "contact.map_text")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl border border-border animate-slide-up">
            <h3 className="font-heading text-xl font-semibold text-card-foreground mb-6">{getSiteText(content, "contact.form_title")}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">{getSiteText(content, "contact.name_label")}</label>
                <Input
                  name="name"
                  value={values.name}
                  onChange={onFieldChange}
                  placeholder={getSiteText(content, "contact.name_placeholder")}
                  required
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">{getSiteText(content, "contact.email_form_label")}</label>
                <Input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={onFieldChange}
                  placeholder={getSiteText(content, "contact.email_placeholder")}
                  required
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">{getSiteText(content, "contact.phone_form_label")}</label>
                <Input
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={onFieldChange}
                  placeholder={getSiteText(content, "contact.phone_placeholder")}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">{getSiteText(content, "contact.message_label")}</label>
                <Textarea
                  name="message"
                  value={values.message}
                  onChange={onFieldChange}
                  placeholder={getSiteText(content, "contact.message_placeholder")}
                  rows={4}
                  required
                  className="bg-background resize-none"
                />
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6">
                <Send className="w-4 h-4 mr-2" />
                {getSiteText(content, "contact.submit_button")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
