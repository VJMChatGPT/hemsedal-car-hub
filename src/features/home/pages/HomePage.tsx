import heroImage from "@/assets/hero-dalmotorer.jpg";

const strengths = [
  "Reliable used vehicles",
  "Affordable rental options",
  "Easy purchase process",
  "No hidden surprises",
];

const HomePage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-24 pt-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-10 md:pb-32 md:pt-20">
      <div className="space-y-8 md:space-y-12">
        <p className="text-sm font-bold uppercase tracking-[0.26em] text-muted-foreground">DAL MOTORER</p>
        <div className="space-y-6">
          <h1 className="text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-7xl">Car Rental &amp; Sales in Hemsedal</h1>
          <p className="max-w-2xl text-3xl font-bold uppercase leading-tight md:text-5xl">DRIVE HEMSEDAL WITHOUT COMPLICATIONS.</p>
        </div>
        <div className="space-y-3 text-lg leading-relaxed text-muted-foreground md:text-xl">
          <p>Mountain roads.</p>
          <p>Winter mornings.</p>
          <p>Season work.</p>
          <p>Weekend escapes.</p>
        </div>
        <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
          You don&apos;t need luxury. You need a car that starts.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary/40 p-3">
        <img src={heroImage} alt="Road through the Hemsedal mountains" className="h-full min-h-[420px] w-full rounded-2xl object-cover" />
      </div>
    </section>

    <section className="border-y border-border bg-secondary/20">
      <div className="mx-auto w-full max-w-7xl space-y-12 px-6 py-20 md:px-10 md:py-28">
        <h2 className="text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
          PRACTICAL CARS.
          <br />
          FAIR PRICES.
          <br />
          STRAIGHT DEALS.
        </h2>

        <div className="space-y-6">
          <p className="text-base font-semibold uppercase tracking-[0.18em] text-muted-foreground">At Dal Motorer, we keep it simple:</p>
          <ul className="grid gap-4 md:grid-cols-2">
            {strengths.map((item) => (
              <li key={item} className="rounded-2xl border border-border bg-background px-6 py-5 text-xl font-semibold leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Our cars are practical, maintained, and ready for Norwegian mountain roads.
        </p>
      </div>
    </section>

    <section className="mx-auto grid w-full max-w-7xl gap-16 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
      <article className="space-y-6">
        <h3 className="text-4xl font-bold uppercase leading-tight md:text-5xl">FOR SEASONAL WORKERS</h3>
        <div className="space-y-2 text-lg leading-relaxed text-muted-foreground">
          <p>Stay for the winter.</p>
          <p>Work the slopes.</p>
          <p>Move freely.</p>
        </div>
        <p className="text-lg font-semibold leading-relaxed md:text-xl">Flexible rental periods. Honest pricing. Quick handover.</p>
      </article>

      <article className="space-y-6">
        <h3 className="text-4xl font-bold uppercase leading-tight md:text-5xl">FOR OCCASIONAL TRAVELLERS</h3>
        <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
          In Hemsedal for a few days? Need transport without paying premium tourist prices?
        </p>
        <p className="text-xl font-semibold md:text-2xl">We&apos;ve got you covered.</p>
      </article>
    </section>

    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-20 md:px-10 md:py-28">
        <h2 className="text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">LOCAL. AVAILABLE. REAL.</h2>
        <div className="space-y-3 text-lg leading-relaxed text-muted-foreground md:text-xl">
          <p>We understand mountain life.</p>
          <p>We understand budgets.</p>
          <p>We understand that transport should be simple.</p>
        </div>
        <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">No drama. No overpromising. Just cars that do the job.</p>
        <p className="text-3xl font-bold uppercase leading-tight md:text-5xl">DRIVE SMART. SPEND LESS. KEEP MOVING.</p>
      </div>
    </section>
  </main>
);

export default HomePage;
