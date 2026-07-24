import { Reveal } from "./Reveal";
import { BlueprintBuilder } from "./BlueprintBuilder";

const demoUrl = "https://altusa-ai-wms-demo.web.app/";
const featureUrl = "https://altusa-ai-wms-demo.web.app/features";
const githubUrl = "https://github.com/zmzhong1/AltusaAI";

const proofCards = [
  {
    number: "01",
    title: "Connect",
    body: "Bridge legacy software, PDFs, spreadsheets, ecommerce, and accounting without forcing a risky all-at-once replacement.",
  },
  {
    number: "02",
    title: "Structure",
    body: "Create reliable customers, products, locations, orders, and approval rules that every workflow can share.",
  },
  {
    number: "03",
    title: "Automate",
    body: "Remove repeat entry, route exceptions to the right person, and keep a clear record of what changed.",
  },
  {
    number: "04",
    title: "Improve",
    body: "Turn connected operations into practical owner reporting, forecasting, and explainable AI assistance.",
  },
];

const workflowSteps = [
  {
    label: "Start small",
    title: "Operations Systems Audit",
    body: "Map the real workflow, quantify avoidable work, and choose one reversible, measurable pilot.",
  },
  {
    label: "Prove value",
    title: "Focused paid pilot",
    body: "Implement one start-to-finish process with a baseline, acceptance criteria, reconciliation, and rollback.",
  },
  {
    label: "Run reliably",
    title: "Managed operations set",
    body: "Configuration, integrations, monitoring, backups, support, and improvements in one ongoing engagement.",
  },
];

const modules = [
  "Order intake",
  "Inventory visibility",
  "Warehouse workflow",
  "Purchasing signals",
  "Customer pricing",
  "Accounting sync",
  "Catalog operations",
  "Owner reporting",
];

const principles = [
  "Humans approve prices, credit, refunds, and material inventory changes.",
  "Client data stays out of public repositories, screenshots, and demonstrations.",
  "Every integration has monitoring, retry behavior, reconciliation, and a manual fallback.",
  "Clients retain clear data-export and offboarding paths.",
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Altusa home">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>
          <span>Altusa</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#approach">Approach</a>
          <a href="#set">Operations set</a>
          <a href="#blueprint">Build yours</a>
          <a href="#audit">Audit</a>
          <a href={featureUrl}>Demo features</a>
        </nav>
        <a className="header-cta" href="#blueprint">
          Build your blueprint
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">
            Operations systems for growing product businesses
          </p>
          <h1>
            Your systems should
            <span> work like one.</span>
          </h1>
          <p className="hero-lede">
            Altusa connects orders, inventory, warehouse operations, ecommerce,
            and accounting—then applies automation and AI where they make work
            clearer, faster, and easier to control.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#blueprint">
              Build your operations blueprint
            </a>
            <a className="button button-secondary" href={demoUrl}>
              Open the warehouse demo
            </a>
          </div>
          <p className="hero-note">
            Built for wholesalers, distributors, catalog retailers, small 3PLs,
            and light manufacturers.
          </p>
        </div>

        <div className="system-card" aria-label="Connected operations overview">
          <div className="system-card-bar">
            <span>ALTUSA / OPERATIONS</span>
            <span className="live-dot">CONNECTED</span>
          </div>
          <div className="signal-grid">
            <div className="signal signal-wide">
              <span>Order flow</span>
              <strong>Email · PDF · CSV · Ecommerce</strong>
              <div className="signal-line">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="signal">
              <span>Exceptions</span>
              <strong>7</strong>
              <small>routed for review</small>
            </div>
            <div className="signal">
              <span>Systems</span>
              <strong>5</strong>
              <small>one operating view</small>
            </div>
            <div className="signal signal-dark">
              <span>Human approval</span>
              <strong>On</strong>
              <small>for material actions</small>
            </div>
            <div className="signal signal-map" aria-hidden="true">
              <span className="map-cell active" />
              <span className="map-cell" />
              <span className="map-cell" />
              <span className="map-cell active" />
              <span className="map-cell" />
              <span className="map-cell active" />
              <span className="map-cell" />
              <span className="map-cell" />
              <span className="map-cell active" />
              <span className="map-cell" />
              <span className="map-cell active" />
              <span className="map-cell" />
            </div>
          </div>
        </div>
      </section>

      <section className="problem-strip" aria-label="Common operational problem">
        <p>
          <span>The common problem</span>
          The business has software. The workflow still lives between the
          software.
        </p>
      </section>

      <section className="section" id="approach">
        <Reveal>
          <div className="section-heading">
            <p className="eyebrow">The Altusa approach</p>
            <h2>Modernize the workflow without losing control.</h2>
            <p>
              We begin with the systems a business already depends on. Each
              improvement is measured, reversible, and designed around the
              people doing the work.
            </p>
          </div>
        </Reveal>
        <div className="proof-grid">
          {proofCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 80}>
              <article className="proof-card">
                <span className="card-number">{card.number}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section set-section" id="set">
        <Reveal>
          <div className="set-intro">
            <div>
              <p className="eyebrow">Flagship offer</p>
              <h2>The Wholesale Operations Set</h2>
            </div>
            <p>
              A managed operational layer connecting the path from incoming
              order to approved fulfillment, purchasing visibility, accounting
              synchronization, and owner reporting.
            </p>
          </div>
        </Reveal>

        <div className="set-layout">
          <Reveal>
            <div className="module-board">
              <div className="module-center">
                <span>Altusa</span>
                <strong>Operations</strong>
              </div>
              {modules.map((module, index) => (
                <div className={`module module-${index + 1}`} key={module}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {module}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="set-copy">
              <div className="feature-row">
                <span>01</span>
                <div>
                  <h3>Keep the right systems</h3>
                  <p>
                    Connect or gradually replace operational software. Keep
                    accounting, payroll, tax, and payments in proven systems.
                  </p>
                </div>
              </div>
              <div className="feature-row">
                <span>02</span>
                <div>
                  <h3>Configure the real workflow</h3>
                  <p>
                    Customer-specific items, approvals, locations, exceptions,
                    and staff permissions reflect how the business operates.
                  </p>
                </div>
              </div>
              <div className="feature-row">
                <span>03</span>
                <div>
                  <h3>Manage the result</h3>
                  <p>
                    Monitoring, backups, support, and incremental improvements
                    are part of the engagement—not an afterthought.
                  </p>
                </div>
              </div>
              <a className="text-link" href={featureUrl}>
                See the working demo and prototype boundaries
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section blueprint-section" id="blueprint">
        <Reveal>
          <div className="section-heading">
            <p className="eyebrow">Make it yours</p>
            <h2>Design the operations layer your business actually needs.</h2>
            <p>
              Select the workflow pressure, systems, and operating modules that
              matter now. Altusa turns those choices into a practical first
              blueprint you can download and review with your team.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <BlueprintBuilder />
        </Reveal>
      </section>

      <section className="section audit-section" id="audit">
        <Reveal>
          <div className="audit-card">
            <div className="audit-copy">
              <p className="eyebrow">The starting point</p>
              <h2>One week to find the workflow worth fixing first.</h2>
              <p>
                The Operations Systems Audit maps the current order and
                inventory workflow, quantifies avoidable work, and produces one
                focused pilot with measurable acceptance criteria.
              </p>
              <ul>
                <li>Current systems and source-of-truth map</li>
                <li>Manual handoff, error, and delay inventory</li>
                <li>Three ranked improvement opportunities</li>
                <li>One fixed-scope pilot brief</li>
                <li>Plain-English owner readout</li>
              </ul>
            </div>
            <div className="audit-aside">
              <span className="audit-kicker">Fixed scope</span>
              <strong>5 working days</strong>
              <p>
                No production credentials required. No obligation to build.
                Audit fee is credited toward an approved pilot.
              </p>
              <a className="button button-light" href={githubUrl}>
                Follow Altusa on GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section process-section">
        <Reveal>
          <div className="section-heading compact">
            <p className="eyebrow">How engagements work</p>
            <h2>Diagnose. Prove. Operate.</h2>
          </div>
        </Reveal>
        <div className="workflow-grid">
          {workflowSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 90}>
              <article className="workflow-card">
                <span>{step.label}</span>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section trust-section">
        <Reveal>
          <div className="trust-layout">
            <div>
              <p className="eyebrow">Trust is part of the system</p>
              <h2>Automation with boundaries.</h2>
              <p>
                The goal is dependable operational leverage—not autonomous
                software making financial decisions in the dark.
              </p>
            </div>
            <ol>
              {principles.map((principle, index) => (
                <li key={principle}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {principle}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      <section className="closing">
        <Reveal>
          <p className="eyebrow">Early validation</p>
          <h2>Start with one workflow. Earn the right to expand.</h2>
          <p>
            Altusa is opening founder-led audits and focused pilots for
            product-based small businesses. Public demonstrations contain
            fictional data only.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={demoUrl}>
              Explore the live demo
            </a>
            <a className="button button-secondary" href={githubUrl}>
              Review the public source
            </a>
          </div>
        </Reveal>
      </section>

      <footer>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>
          <span>Altusa</span>
        </div>
        <p>Connected operations for growing product businesses.</p>
        <div>
          <a href={demoUrl}>Demo</a>
          <a href={featureUrl}>Features</a>
          <a href="#blueprint">Build yours</a>
          <a href={githubUrl}>GitHub</a>
        </div>
      </footer>
    </main>
  );
}
