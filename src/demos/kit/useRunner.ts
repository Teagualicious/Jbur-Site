// Drives a run log: reveal lines one at a time (Run all), one per click
// (Step), or start over (Reset). Run all stops at `until`, which a demo uses
// to pause at a step that waits on a person.
import { useEffect, useRef, useState } from "preact/hooks";

const DELAY_MS = 175;

const reducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useRunner(total: number) {
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const stop = () => {
    clearInterval(timer.current);
    timer.current = undefined;
    setRunning(false);
  };

  useEffect(() => stop, []);

  const runTo = (until = total) => {
    stop();
    const target = Math.min(until, total);
    if (reducedMotion()) {
      setShown((n) => Math.max(n, target));
      return;
    }
    setRunning(true);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= target) stop();
        return Math.min(n + 1, target);
      });
    }, DELAY_MS);
  };

  return {
    shown,
    running,
    done: shown >= total,
    runTo,
    step: () => {
      stop();
      setShown((n) => Math.min(n + 1, total));
    },
    reset: () => {
      stop();
      setShown(0);
    },
  };
}
