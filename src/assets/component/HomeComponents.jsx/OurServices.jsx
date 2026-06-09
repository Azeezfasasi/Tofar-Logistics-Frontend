import React from 'react';

export default function OurServicesSection() {
  const services = [
    {
      title: 'AIR FREIGHT',
      description:
        'Expedite your shipments globally with our reliable air freight solutions. We ensure fast and secure delivery for time-sensitive cargo, connecting major hubs worldwide.',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 16l20-8-20-8 10 16z" />
          <path d="M12 8l10-4" />
        </svg>
      ),
    },
    {
      title: 'SEA FREIGHT',
      description:
        'Cost-effective and efficient sea freight services for large volume shipments. We handle full container loads (FCL) and less than container loads (LCL) with comprehensive logistics support.',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5h18" />
          <path d="M6 5l2 14h8l2-14" />
          <path d="M9 11h6" />
        </svg>
      ),
    },
    {
      title: 'ROAD TRANSPORT',
      description:
        'Flexible and dependable road transport services for domestic and cross-border deliveries. Our fleet ensures timely and safe ground transportation of your goods.',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7h12l3 3v9H3V7z" />
          <path d="M15 7v4h6" />
          <circle cx="7.5" cy="18" r="1.5" />
          <circle cx="17.5" cy="18" r="1.5" />
        </svg>
      ),
    },
    {
      title: 'WAREHOUSING',
      description:
        'Secure and strategically located warehousing solutions for all your storage needs. We offer inventory management, distribution, and value-added services to optimize your supply chain.',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-6 9 6" />
          <path d="M9 22V12h6v10" />
          <path d="M4 22h16" />
        </svg>
      ),
    },
    {
      title: 'CUSTOMS BROKERAGE',
      description:
        'Navigate complex customs regulations with ease. Our expert customs brokerage services ensure smooth clearance and compliance for international shipments, minimizing delays.',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
        </svg>
      ),
    },
    {
      title: 'PROJECT CARGO',
      description:
        'Specialized handling for oversized, heavy-lift, and complex project cargo. We provide end-to-end solutions for challenging logistics projects, ensuring safe and efficient delivery.',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20" />
          <path d="M5 9l7-7 7 7" />
          <path d="M5 15l7 7 7-7" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 px-4 font-sans">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.25),transparent_55%)]" />
      </div>

      <div className="container mx-auto text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold tracking-widest text-white/80 ring-1 ring-white/10">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
          WHAT WE DO
        </p>

        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          FEATURED SERVICES
        </h2>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="group relative overflow-hidden rounded-2xl bg-white/5 p-7 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_12px_40px_rgba(0,0,0,0.45)]"
            >
              {/* Decorative border glow */}
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
                <div className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-200 ring-1 ring-white/10 transition-colors duration-300 group-hover:text-cyan-100">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white sm:text-xl">{service.title}</h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/70">{service.description}</p>

              <div className="mt-6">
                <a
                  href="/app/requestquote"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400/90 to-blue-500/90 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  LEARN MORE
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-xs text-white/50">
          Fast quotes, reliable logistics—built for the way your business moves.
        </p>
      </div>
    </section>
  );
}

