import heroImage from "@/assets/hero-dalmotorer.jpg";

const strengths = [
  "Reliable used vehicles",
  "Affordable rental options",
  "Easy purchase process",
  "No hidden surprises",
];

const HomePage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-14 md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:px-12 md:pb-36 md:pt-24">
      <div className="space-y-12 md:space-y-16">
        <div className="space-y-6">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">DAL MOTORER</p>
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight md:text-7xl">Car Rental &amp; Sales in Hemsedal</h1>
          <p className="max-w-4xl text-3xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">DRIVE HEMSEDAL WITHOUT COMPLICATIONS.</p>
        </div>

        <div className="space-y-3 text-lg leading-relaxed text-muted-foreground md:text-xl">
          <p>Mountain roads.</p>
          <p>Winter mornings.</p>
          <p>Season work.</p>
          <p>Weekend escapes.</p>
        </div>

        <p className="max-w-2xl text-xl leading-relaxed md:text-2xl">You don&apos;t need luxury. You need a car that starts.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border p-3">
        <img src={heroImage} alt="Road through the Hemsedal mountains" className="h-full min-h-[480px] w-full rounded-2xl object-cover" />
      </div>
    </section>

    <section className="border-y border-border">
      <div className="mx-auto w-full max-w-7xl space-y-14 px-6 py-24 md:space-y-16 md:px-12 md:py-32">
        <h2 className="text-4xl font-black uppercase leading-[0.92] tracking-tight md:text-7xl">
          PRACTICAL CARS.
          <br />
          FAIR PRICES.
          <br />
          STRAIGHT DEALS.
        </h2>

        <div className="space-y-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">At Dal Motorer, we keep it simple:</p>
          <ul className="grid gap-4 md:grid-cols-2">
            {strengths.map((item) => (
              <li key={item} className="rounded-2xl border border-border px-6 py-6 text-xl font-bold leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
          Our cars are practical, maintained, and ready for Norwegian mountain roads.
        </p>
      </div>
    </section>

    <section className="mx-auto grid w-full max-w-7xl gap-16 px-6 py-24 md:grid-cols-2 md:gap-20 md:px-12 md:py-32">
      <article className="space-y-8">
        <h3 className="text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">FOR SEASONAL WORKERS</h3>
        <div className="space-y-2 text-lg leading-relaxed text-muted-foreground md:text-xl">
          <p>Stay for the winter.</p>
          <p>Work the slopes.</p>
          <p>Move freely.</p>
        </div>
        <p className="text-xl font-bold leading-relaxed md:text-2xl">Flexible rental periods. Honest pricing. Quick handover.</p>
      </article>

      <article className="space-y-8">
        <h3 className="text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">FOR OCCASIONAL TRAVELLERS</h3>
        <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
          In Hemsedal for a few days? Need transport without paying premium tourist prices?
        </p>
        <p className="text-2xl font-bold">We&apos;ve got you covered.</p>
      </article>
    </section>

    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-24 md:space-y-12 md:px-12 md:py-32">
        <h2 className="text-4xl font-black uppercase leading-[0.92] tracking-tight md:text-7xl">LOCAL. AVAILABLE. REAL.</h2>
        <div className="space-y-3 text-lg leading-relaxed text-muted-foreground md:text-xl">
          <p>We understand mountain life.</p>
          <p>We understand budgets.</p>
          <p>We understand that transport should be simple.</p>
        </div>
        <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">No drama. No overpromising. Just cars that do the job.</p>
        <p className="text-3xl font-black uppercase leading-tight md:text-6xl">DRIVE SMART. SPEND LESS. KEEP MOVING.</p>
      </div>
    </section>
  </main>
);

export default HomePage;
