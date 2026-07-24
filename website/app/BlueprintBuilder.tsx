"use client";

import { useMemo, useState } from "react";

type ModuleId =
  | "orders"
  | "inventory"
  | "warehouse"
  | "purchasing"
  | "pricing"
  | "accounting"
  | "catalog"
  | "reporting";

const moduleOptions: Array<{
  id: ModuleId;
  label: string;
  description: string;
}> = [
  {
    id: "orders",
    label: "Order intake",
    description: "Unify email, PDF, CSV, ecommerce, and manual orders.",
  },
  {
    id: "inventory",
    label: "Inventory visibility",
    description: "Create one reliable stock and availability view.",
  },
  {
    id: "warehouse",
    label: "Warehouse workflow",
    description: "Guide picking, review, exceptions, and bin activity.",
  },
  {
    id: "purchasing",
    label: "Purchasing signals",
    description: "Prioritize replenishment and supplier follow-up.",
  },
  {
    id: "pricing",
    label: "Customer pricing",
    description: "Control customer-specific items, terms, and approvals.",
  },
  {
    id: "accounting",
    label: "Accounting sync",
    description: "Reduce re-entry while keeping finance systems authoritative.",
  },
  {
    id: "catalog",
    label: "Catalog operations",
    description: "Manage product data across selling and operating channels.",
  },
  {
    id: "reporting",
    label: "Owner reporting",
    description: "Surface exceptions, workload, margin, and operating health.",
  },
];

const pressureLabels: Record<string, string> = {
  reentry: "Repeated data entry",
  inventory: "Unreliable inventory",
  exceptions: "Order exceptions and delays",
  visibility: "Limited owner visibility",
};

const businessLabels: Record<string, string> = {
  wholesale: "Importer or wholesaler",
  distribution: "Distributor",
  retail: "Catalog or multichannel retailer",
  logistics: "Small 3PL or fulfillment operator",
  manufacturing: "Light manufacturer or assembler",
};

export function BlueprintBuilder() {
  const [business, setBusiness] = useState("wholesale");
  const [pressure, setPressure] = useState("reentry");
  const [systems, setSystems] = useState("3–4");
  const [selected, setSelected] = useState<ModuleId[]>([
    "orders",
    "inventory",
    "warehouse",
  ]);
  const [copyLabel, setCopyLabel] = useState("Copy summary");

  const selectedModules = useMemo(
    () => moduleOptions.filter((module) => selected.includes(module.id)),
    [selected],
  );

  const blueprintText = useMemo(() => {
    const moduleLines = selectedModules
      .map((module) => `- ${module.label}: ${module.description}`)
      .join("\n");

    return `ALTUSA OPERATIONS BLUEPRINT

Business: ${businessLabels[business]}
Primary pressure: ${pressureLabels[pressure]}
Systems involved today: ${systems}

SELECTED OPERATING MODULES
${moduleLines || "- Select at least one operating module"}

RECOMMENDED FIRST 90 DAYS
1. Diagnose — map the current workflow, owners, systems of record, and baseline.
2. Prove — configure one end-to-end pilot around the primary pressure.
3. Operate — reconcile results, document fallback, and decide whether to expand.

CONTROL BOUNDARIES
- Humans approve financial and material inventory actions.
- Existing accounting, payroll, tax, and payment systems remain authoritative.
- Every connection needs monitoring, reconciliation, retry behavior, and fallback.

This planning output is generated locally in your browser and is not submitted.`;
  }, [business, pressure, selectedModules, systems]);

  function toggleModule(id: ModuleId) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((moduleId) => moduleId !== id)
        : [...current, id],
    );
  }

  async function copyBlueprint() {
    try {
      await navigator.clipboard.writeText(blueprintText);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy summary"), 1800);
    } catch {
      setCopyLabel("Copy unavailable");
    }
  }

  function downloadBlueprint() {
    const blob = new Blob([blueprintText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "altusa-operations-blueprint.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="blueprint-builder">
      <form className="blueprint-form" onSubmit={(event) => event.preventDefault()}>
        <div className="builder-step">
          <span className="builder-step-number">01</span>
          <div className="builder-field">
            <label htmlFor="business-type">Your operating model</label>
            <select
              id="business-type"
              value={business}
              onChange={(event) => setBusiness(event.target.value)}
            >
              {Object.entries(businessLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="builder-field">
            <label htmlFor="system-count">Systems used in daily operations</label>
            <select
              id="system-count"
              value={systems}
              onChange={(event) => setSystems(event.target.value)}
            >
              <option value="1–2">1–2 systems</option>
              <option value="3–4">3–4 systems</option>
              <option value="5–7">5–7 systems</option>
              <option value="8+">8 or more systems</option>
            </select>
          </div>
        </div>

        <fieldset className="builder-step">
          <legend>
            <span className="builder-step-number">02</span>
            Biggest operating pressure
          </legend>
          <div className="pressure-grid">
            {Object.entries(pressureLabels).map(([value, label]) => (
              <label
                className={`choice-pill ${pressure === value ? "is-selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name="pressure"
                  value={value}
                  checked={pressure === value}
                  onChange={(event) => setPressure(event.target.value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="builder-step">
          <legend>
            <span className="builder-step-number">03</span>
            Modules to connect first
          </legend>
          <div className="module-choice-grid">
            {moduleOptions.map((module) => {
              const checked = selected.includes(module.id);
              return (
                <label
                  className={`module-choice ${checked ? "is-selected" : ""}`}
                  key={module.id}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleModule(module.id)}
                  />
                  <span className="module-choice-check" aria-hidden="true">
                    {checked ? "✓" : "+"}
                  </span>
                  <strong>{module.label}</strong>
                  <small>{module.description}</small>
                </label>
              );
            })}
          </div>
        </fieldset>
      </form>

      <aside className="blueprint-output" aria-live="polite">
        <div className="blueprint-output-header">
          <span>Your first blueprint</span>
          <strong>{selectedModules.length} modules</strong>
        </div>
        <div className="blueprint-summary">
          <p>{businessLabels[business]}</p>
          <h3>{pressureLabels[pressure]}</h3>
          <div className="blueprint-tags">
            {selectedModules.map((module) => (
              <span key={module.id}>{module.label}</span>
            ))}
          </div>
        </div>
        <ol className="blueprint-timeline">
          <li>
            <span>Weeks 1–2</span>
            <strong>Diagnose</strong>
            Map workflow, ownership, systems, and baseline.
          </li>
          <li>
            <span>Weeks 3–8</span>
            <strong>Prove</strong>
            Configure one measurable, reversible pilot.
          </li>
          <li>
            <span>Weeks 9–12</span>
            <strong>Operate</strong>
            Reconcile, document fallback, and choose the next module.
          </li>
        </ol>
        <div className="blueprint-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={downloadBlueprint}
            disabled={selectedModules.length === 0}
          >
            Download blueprint
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={copyBlueprint}
            disabled={selectedModules.length === 0}
          >
            {copyLabel}
          </button>
        </div>
        <p className="blueprint-privacy">
          Private by default: this builder runs in your browser and submits
          nothing.
        </p>
      </aside>
    </div>
  );
}
