# Build Task: iot-security-checker

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: iot-security-checker
HEADLINE: Scan your home IoT devices for vulnerabilities
WHAT: None
WHY: None
WHO PAYS: None
NICHE: security-tools
PRICE: $$15/mo

ARCHITECTURE SPEC:
A Next.js web app that scans local networks for IoT devices and checks them against vulnerability databases. Users authenticate, run network scans, and receive detailed security reports with remediation steps.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/scan/page.tsx
- app/api/scan/route.ts
- app/api/devices/route.ts
- app/api/vulnerabilities/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- components/DeviceCard.tsx
- components/VulnerabilityReport.tsx
- components/NetworkScanner.tsx
- lib/scanner.ts
- lib/vulnerability-db.ts
- lib/lemonsqueezy.ts
- lib/auth.ts

DEPENDENCIES: next, tailwindcss, next-auth, prisma, @prisma/client, node-nmap, axios, @lemonsqueezy/lemonsqueezy.js, zod, lucide-react, recharts

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.


PREVIOUS ATTEMPT FAILED WITH:
Codex exited 1: Reading additional input from stdin...
OpenAI Codex v0.121.0 (research preview)
--------
workdir: /tmp/openclaw-builds/iot-security-checker
model: gpt-5.3-codex
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 019d94ef-c1d2-70c2-a0f1-56936d3e3c1e
--------
user
# Build Task: iot-security-checker

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: iot-security-checker
HEADLINE: Scan your home IoT 
Please fix the above errors and regenerate.