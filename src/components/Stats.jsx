import { useEffect, useRef, useState } from "react";

function useCountUp(target, duration = 2000) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  const startTime = useRef(null);

  function animate(ts) {
    if (!startTime.current) startTime.current = ts;
    const progress = Math.min((ts - startTime.current) / duration, 1);
    setVal(Math.floor(progress * target));
    if (progress < 1) frame.current = requestAnimationFrame(animate);
  }

  return {
    val,
    start() {
      if (frame.current) cancelAnimationFrame(frame.current);
      startTime.current = null;
      frame.current = requestAnimationFrame(animate);
    },
    cancel() {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
  };
}

export default function Stats() {
  const items = [
    { k: "Years of Experience", v: 30 },
    { k: "Countries", v:12 },
    { k: "Shipments Delivered", v: 100 },
  ];

  const counters = items.map((it) => useCountUp(it.v, 2000));

  const refs = useRef([]);

  if (refs.current.length !== items.length)
    refs.current = Array(items.length).fill(null);

  const started = useRef(new Array(items.length).fill(false));

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      counters.forEach((c) => c.start());
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.dataset.idx);
          if (entry.isIntersecting && !started.current[idx]) {
            started.current[idx] = true;
            counters[idx].start();
          }
        });
      },
      { threshold: 0.35 }
    );

    refs.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    return () => {
      obs.disconnect();
      counters.forEach((c) => c.cancel && c.cancel());
    };
  }, []);

  return (
    <div className="bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {items.map((it, i) => (
              <div key={i} className="w-full">
                <div
                  ref={(el) => (refs.current[i] = el)}
                  data-idx={i}
                  className="relative w-full h-full flex flex-col items-center justify-center px-6 py-8 rounded-2xl overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.02), 0 8px 24px rgba(2,6,23,0.5)",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: -28,
                      left: "-10%",
                      width: "120%",
                      height: 36,
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02))",
                      transform: "rotate(-3deg)",
                      pointerEvents: "none",
                      filter: "blur(6px)",
                    }}
                  />

                  <div className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none">
                    {counters[i].val}
                    <span className="ml-1 text-lg sm:text-xl font-medium">
                      +
                    </span>
                  </div>

                  <div className="text-white/70 text-xs sm:text-sm mt-3 uppercase tracking-wide text-center">
                    {it.k}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
