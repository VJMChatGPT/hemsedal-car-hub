import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_IDS, SITE_CONFIG } from "@/constants/site";
import { useFormFields } from "@/features/home/hooks/useFormFields";
import { ContactFormValues } from "@/features/home/types/home";
import { SectionTitle } from "@/features/home/components/SectionTitle";

const initialContactValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export const ContactSection = () => {
  const { values, onFieldChange, resetValues } = useFormFields(initialContactValues);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Thank you! We'll get back to you within 24 hours.");
    resetValues();
  };

  return (
    <section id={SECTION_IDS.contact} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Get In Touch"
          title="Ready to Hit the Road?"
          description="Contact us to book your vehicle or get more information about our rental and sales options. We're here to help!"
        />

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8 animate-slide-up">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="font-heading text-xl font-semibold text-card-foreground mb-6">Contact Information</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Address</p>
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
                    <p className="font-medium text-card-foreground">Phone</p>
                    <p className="text-muted-foreground">{SITE_CONFIG.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Email</p>
                    <p className="text-muted-foreground">{SITE_CONFIG.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Opening Hours</p>
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
              <p className="text-muted-foreground">📍 Located in the heart of Dal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl border border-border animate-slide-up">
            <h3 className="font-heading text-xl font-semibold text-card-foreground mb-6">Send Us a Message</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Your Name</label>
                <Input name="name" value={values.name} onChange={onFieldChange} placeholder="Enter your name" required className="bg-background" />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={onFieldChange}
                  placeholder="Enter your email"
                  required
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Phone Number</label>
                <Input
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={onFieldChange}
                  placeholder="+47 000 00 000"
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Message</label>
                <Textarea
                  name="message"
                  value={values.message}
                  onChange={onFieldChange}
                  placeholder="Tell us which car you're interested in, preferred dates, or any questions..."
                  rows={4}
                  required
                  className="bg-background resize-none"
                />
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
