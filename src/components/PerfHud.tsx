import { useEffect, useState } from "react";

function pingOrigin(): Promise<number | null> {
  const started = performance.now();
  const url = `${window.location.origin}/favicon.svg?t=${Date.now()}`;
  return fetch(url, { method: "HEAD", cache: "no-store" })
    .catch(() => fetch(url, { cache: "no-store" }))
    .then((response) => (response.ok ? Math.round(performance.now() - started) : null))
    .catch(() => null);
}

export function PerfHud() {
  const [fps, setFps] = useState<number | null>(null);
  const [ping, setPing] = useState<number | null>(null);

  useEffect(() => {
    let frames = 0;
    let windowStart = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      frames += 1;
      if (now - windowStart >= 1000) {
        setFps(frames);
        frames = 0;
        windowStart = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sample = () => {
      void pingOrigin().then((ms) => {
        if (!cancelled) setPing(ms);
      });
    };
    sample();
    const id = window.setInterval(sample, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <p className="perf-hud" aria-hidden="true">
      {fps == null ? "—" : fps} fps · {ping == null ? "—" : `${ping} ms`}
    </p>
  );
}
