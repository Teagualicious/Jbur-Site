import type { ComponentChildren } from "preact";
import "./kit.css";

interface Props {
  title: string;
  version: string;
  /** Launch month of the real product, e.g. "Aug 2026". */
  launched: string;
  onRunAll: () => void;
  onStep: () => void;
  onReset: () => void;
  running?: boolean;
  /** Nothing left to run until the visitor acts (or the run is complete). */
  idle?: boolean;
  children: ComponentChildren;
}

export function DemoFrame(props: Props) {
  const { title, version, launched, running = false, idle = false } = props;
  return (
    <figure class="demo" aria-label={`Demo: ${title}`}>
      <div class="demo-head">
        <div>
          <p class="demo-title">{title}</p>
          <p class="demo-label">
            Demo · made-up data · v{version} · {launched}
          </p>
        </div>
        <div class="demo-btns">
          <button type="button" class="btn primary" onClick={props.onRunAll} disabled={running || idle}>
            Run all
          </button>
          <button type="button" class="btn" onClick={props.onStep} disabled={running || idle}>
            Step
          </button>
          <button type="button" class="btn ghost" onClick={props.onReset}>
            Reset
          </button>
        </div>
      </div>
      <div class="demo-body">{props.children}</div>
    </figure>
  );
}
