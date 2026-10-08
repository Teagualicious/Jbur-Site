import "./kit.css";

export interface Kpi {
  label: string;
  value: string | number;
  /** "warn" marks a number that needs a person. */
  tone?: "warn";
}

export function Kpis({ items }: { items: Kpi[] }) {
  return (
    <dl class="kpis">
      {items.slice(0, 3).map((k) => (
        <div class={k.tone === "warn" ? "warn" : undefined}>
          <dt>{k.label}</dt>
          <dd>{k.value}</dd>
        </div>
      ))}
    </dl>
  );
}
