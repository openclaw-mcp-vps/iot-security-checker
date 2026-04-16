export default function Home() {
  const checkoutUrl = process.env.NEXT_PUBLIC_LS_CHECKOUT_URL || "#";

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Nav */}
      <nav className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-[#58a6ff] font-bold text-lg tracking-tight">IoT Security Checker</span>
        <a href={checkoutUrl} className="bg-[#58a6ff] text-[#0d1117] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#79b8ff] transition-colors">
          Get Started
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <span className="inline-block bg-[#161b22] border border-[#21262d] text-[#58a6ff] text-xs font-medium px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
          Network Security
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Scan Your Home IoT Devices<br />
          <span className="text-[#58a6ff]">for Vulnerabilities</span>
        </h1>
        <p className="text-[#8b949e] text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Discover exposed cameras, routers, smart TVs, and more. Get instant security reports with step-by-step remediation guidance — before attackers find them first.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={checkoutUrl} className="bg-[#58a6ff] text-[#0d1117] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#79b8ff] transition-colors shadow-lg">
            Start Scanning — $15/mo
          </a>
          <a href="#faq" className="border border-[#30363d] text-[#c9d1d9] font-semibold px-8 py-4 rounded-lg text-lg hover:border-[#58a6ff] hover:text-[#58a6ff] transition-colors">
            Learn More
          </a>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { icon: "🔍", title: "Deep Network Scan", desc: "Identifies every IoT device on your local network automatically." },
            { icon: "🛡️", title: "CVE Database Check", desc: "Cross-references devices against thousands of known vulnerabilities." },
            { icon: "📋", title: "Remediation Reports", desc: "Clear, actionable steps to patch and secure each vulnerable device." }
          ].map((f) => (
            <div key={f.title} className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-[#8b949e] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-[#8b949e] mb-12">One plan. Everything included. Cancel anytime.</p>
        <div className="max-w-sm mx-auto bg-[#161b22] border-2 border-[#58a6ff] rounded-2xl p-8 shadow-xl">
          <div className="text-[#58a6ff] text-sm font-semibold uppercase tracking-widest mb-2">Pro Plan</div>
          <div className="text-5xl font-extrabold text-white mb-1">$15<span className="text-xl font-normal text-[#8b949e]">/mo</span></div>
          <p className="text-[#8b949e] text-sm mb-8">Billed monthly. Cancel anytime.</p>
          <ul className="text-left space-y-3 mb-8">
            {[
              "Unlimited network scans",
              "CVE vulnerability database access",
              "Detailed PDF security reports",
              "Email alerts for new threats",
              "Priority support"
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-[#c9d1d9]">
                <span className="text-[#58a6ff] font-bold">✓</span> {item}
              </li>
            ))}
          </ul>
          <a href={checkoutUrl} className="block w-full bg-[#58a6ff] text-[#0d1117] font-bold py-3 rounded-lg text-center hover:bg-[#79b8ff] transition-colors">
            Subscribe Now
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "How does the network scan work?",
              a: "Our scanner uses a lightweight agent you run on your local network. It discovers devices via ARP and mDNS, fingerprints them, and checks each against our CVE database — all without sending sensitive data off your network."
            },
            {
              q: "Is my network data kept private?",
              a: "Yes. Device fingerprints and vulnerability lookups are anonymized. We never store IP addresses, MAC addresses, or any personally identifiable network information beyond your account session."
            },
            {
              q: "What devices can it detect?",
              a: "Routers, IP cameras, smart TVs, NAS drives, smart speakers, thermostats, and any other networked device. If it has an IP address, we can scan it."
            }
          ].map((item) => (
            <div key={item.q} className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">{item.q}</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#21262d] py-8 text-center text-[#8b949e] text-sm">
        <p>© {new Date().getFullYear()} IoT Security Checker. All rights reserved.</p>
      </footer>
    </main>
  );
}
