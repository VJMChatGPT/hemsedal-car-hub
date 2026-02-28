import heroImage from "@/assets/hero-dalmotorer.jpg";

const pillars = [
  { title: "Built for Winter", text: "Heated cabins, AWD confidence, and vehicles selected for mountain weather." },
  { title: "No Noise, No Friction", text: "Fast booking, clear pricing, and clean handovers from start to finish." },
  { title: "Local by Design", text: "From Hemsedal roads to cabin access points, every route is familiar to our team." },
];

const HomePage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-10 md:pb-28 md:pt-16">
      <div className="flex flex-col justify-between gap-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Hemsedal Car Hub</p>
        <div className="space-y-6">
          <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">Drive Norway with calm confidence.</h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Premium rental cars for mountain weekends, ski trips, and clean Scandinavian road travel.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-full bg-foreground px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-85">
            Book now
          </button>
          <button className="rounded-full border border-border px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-secondary">
            View fleet
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary/40 p-3">
        <img src={heroImage} alt="Scenic road in Hemsedal" className="h-full w-full rounded-2xl object-cover" />
      </div>
    </section>

    <section className="border-y border-border bg-secondary/35">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 md:grid-cols-3 md:gap-12 md:px-10 md:py-24">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{pillar.title}</h2>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">{pillar.text}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16 md:flex-row md:items-end md:justify-between md:px-10 md:py-24">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Simple process</p>
        <h2 className="text-4xl font-semibold leading-tight md:text-6xl">Pick. Confirm. Drive.</h2>
      </div>
      <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
        Tell us your dates and destination. We prepare the right car, ready on time, with everything arranged before you arrive.
      </p>
    </section>
  </main>
);

export default HomePage;
