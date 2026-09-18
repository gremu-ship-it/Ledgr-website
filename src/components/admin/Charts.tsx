"use client";

/**
 * Charts for the dashboard, drawn as inline SVG.
 *
 * No charting library: these are a handful of bars and a line, they render on
 * the server with no JS, and a dependency-free page loads instantly on a
 * Malawian mobile connection — which is the whole point of the site.
 */

export type Point = { day: string; visitors: number; sessions: number; pageviews: number };

function shortDay(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Daily pageviews as a bar chart; visitors overlaid as a line. */
export function TrafficChart({ data, height = 180 }: { data: Point[]; height?: number }) {
  if (!data.length) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No traffic recorded yet. Open the site in another tab and this fills in within seconds.
      </p>
    );
  }

  const width = 720;
  const padding = { top: 12, right: 8, bottom: 22, left: 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((d) => Math.max(d.pageviews, d.visitors)));
  const step = innerW / data.length;
  const barW = Math.max(2, Math.min(step * 0.62, 26));

  const x = (i: number) => padding.left + i * step + step / 2;
  const y = (value: number) => padding.top + innerH - (value / max) * innerH;

  const linePoints = data
    .map((d, i) => `${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`)
    .join(" ");

  // Six x-axis labels at most, so they never collide on a narrow screen.
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Daily pageviews and visitors for the last ${data.length} days`}
      >
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d9e75" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1d9e75" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={fraction}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * (1 - fraction)}
            y2={padding.top + innerH * (1 - fraction)}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        ))}

        {data.map((point, index) => {
          const barHeight = Math.max(1, (point.pageviews / max) * innerH);
          return (
            <rect
              key={point.day}
              x={x(index) - barW / 2}
              y={padding.top + innerH - barHeight}
              width={barW}
              height={barHeight}
              rx={Math.min(3, barW / 2)}
              fill="url(#barFill)"
            >
              <title>{`${shortDay(point.day)} — ${point.pageviews} page views, ${point.visitors} visitors`}</title>
            </rect>
          );
        })}

        <polyline
          points={linePoints}
          fill="none"
          stroke="#115441"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((point, index) =>
          index % labelEvery === 0 ? (
            <text
              key={`label-${point.day}`}
              x={x(index)}
              y={height - 6}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              {shortDay(point.day)}
            </text>
          ) : null,
        )}
      </svg>

      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-500/70" /> Page views
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-brand-800" /> Visitors
        </span>
      </div>
    </div>
  );
}

/** A compact horizontal bar list — used for pages, sources, devices, geo. */
export function BarList({
  items,
  emptyText = "Nothing recorded yet.",
}: {
  items: { label: string; value: number; sub?: string }[];
  emptyText?: string;
}) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-slate-500">{emptyText}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-medium text-ink" title={item.label}>
              {item.label}
            </span>
            <span className="shrink-0 tabular-nums text-slate-500">
              {item.value}
              {item.sub ? <span className="ml-2 text-xs text-slate-400">{item.sub}</span> : null}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The five-step funnel, each step as a share of the first. */
export function FunnelChart({ steps }: { steps: { label: string; visitors: number; hint: string }[] }) {
  const top = steps[0]?.visitors || 0;
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const share = top ? (step.visitors / top) * 100 : 0;
        const previous = index > 0 ? steps[index - 1]!.visitors : 0;
        const dropoff =
          index > 0 && previous ? Math.round(((previous - step.visitors) / previous) * 100) : null;
        return (
          <li key={step.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{step.label}</span>
              <span className="tabular-nums text-slate-600">
                {step.visitors}
                {index > 0 && top ? (
                  <span className="ml-2 text-xs text-slate-400">{Math.round(share)}% of all</span>
                ) : null}
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                style={{ width: `${Math.max(1.5, share)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {step.hint}
              {dropoff !== null && dropoff > 0 ? (
                <span className="ml-1 text-amber-600">· {dropoff}% dropped off here</span>
              ) : null}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Big number with a period-over-period delta. */
export function Stat({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  delta?: number | null;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {typeof delta === "number" && Number.isFinite(delta) ? (
          <span
            className={
              delta > 0
                ? "font-medium text-emerald-600"
                : delta < 0
                  ? "font-medium text-red-500"
                  : "text-slate-400"
            }
          >
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "–"} {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? <span className="text-slate-500">{hint}</span> : null}
      </div>
    </div>
  );
}
