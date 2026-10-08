import "./kit.css";

export type LineStatus = "ok" | "flag" | "wait" | "info";

export interface LogLine {
  time: string;
  text: string;
  status: LineStatus;
}

const statusText: Record<LineStatus, string> = {
  ok: "done",
  flag: "flagged",
  wait: "needs a person",
  info: "",
};

interface Props {
  lines: LogLine[];
  shown: number;
  /** Shown before anything has run. */
  placeholder?: string;
}

export function RunLog({ lines, shown, placeholder = "Press Run all or Step to start." }: Props) {
  const visible = lines.slice(0, shown);
  return (
    <div class="runlog">
      <ol aria-live="polite" aria-label="Run log">
        {visible.map((line, i) => (
          <li key={i} class={`line ${line.status}`}>
            <span class="time">{line.time}</span>
            <span class="text">{line.status === "wait" ? <mark>{line.text}</mark> : line.text}</span>
            <span class="status">{statusText[line.status]}</span>
          </li>
        ))}
      </ol>
      {visible.length === 0 && <p class="runlog-empty">{placeholder}</p>}
    </div>
  );
}
