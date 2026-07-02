import React, { useMemo } from 'react';

interface PriceChartProps {
  data: [number, number][];
  loading?: boolean;
  positive?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, loading, positive = true }) => {
  const chart = useMemo(() => {
    if (data.length < 2) return null;

    const prices = data.map(([, price]) => price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const width = 760;
    const height = 220;
    const padding = { top: 16, right: 16, bottom: 28, left: 16 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const points = data.map(([timestamp, price], index) => {
      const x = padding.left + (index / (data.length - 1)) * innerW;
      const y = padding.top + innerH - ((price - min) / range) * innerH;
      return { x, y, price, timestamp };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

    const startLabel = new Date(data[0][0]).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const endLabel = new Date(data[data.length - 1][0]).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    return { points, linePath, areaPath, min, max, width, height, padding, innerH, startLabel, endLabel };
  }, [data]);

  const color = positive ? '#10b981' : '#ef4444';

  if (loading && data.length < 2) {
    return (
      <div
        style={{
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Loading chart...
      </div>
    );
  }

  if (!chart) {
    return (
      <div
        style={{
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Chart unavailable
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.15)',
            zIndex: 1,
            borderRadius: '8px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          Loading...
        </div>
      )}
      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chart.padding.top + chart.innerH * (1 - ratio);
          const price = chart.min + (chart.max - chart.min) * ratio;
          return (
            <g key={ratio}>
              <line
                x1={chart.padding.left}
                y1={y}
                x2={chart.width - chart.padding.right}
                y2={y}
                stroke="var(--border-color)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <text x={chart.padding.left} y={y - 4} fill="var(--text-muted)" fontSize="10">
                ${price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price.toFixed(2)}
              </text>
            </g>
          );
        })}

        <path d={chart.areaPath} fill="url(#chartGradient)" />
        <path d={chart.linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>{chart.startLabel}</span>
        <span>{chart.endLabel}</span>
      </div>
    </div>
  );
};
