// @ts-nocheck
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { getVisaStatus } from './Travelconstants';
import { Maximize2, X, Plus, Minus } from 'lucide-react';

// Simplified 3-category color scheme matching VisaHQ style
const STATUS_COLOR = {
  home:            '#6366f1', // indigo for home country
  visa_free:       '#22c55e', // green  – No Visa Required
  has_visa:        '#22c55e', // green  – treated same as visa free (you have it)
  evisa:           '#f59e0b', // amber  – E-Visa / on arrival
  visa_on_arrival: '#f59e0b', // amber
  visa_required:   '#ea580c', // orange-red – Paper Visa / Full visa required
  unknown:         '#d1d5db', // light gray
};

const STATUS_LABEL = {
  home:            'Your Country',
  visa_free:       'No Visa Required',
  has_visa:        'No Visa Required',
  evisa:           'E-Visa / Visa on Arrival',
  visa_on_arrival: 'E-Visa / Visa on Arrival',
  visa_required:   'Paper Visa Required',
  unknown:         'Unknown',
};

const STATUS_DOT = {
  home:            '#6366f1',
  visa_free:       '#22c55e',
  has_visa:        '#22c55e',
  evisa:           '#f59e0b',
  visa_on_arrival: '#f59e0b',
  visa_required:   '#ea580c',
  unknown:         '#9ca3af',
};

const LEGEND = [
  { color: '#22c55e', label: 'No Visa Required' },
  { color: '#f59e0b', label: 'E-Visa / Visa on Arrival' },
  { color: '#ea580c', label: 'Paper Visa Required' },
];

function mercator(lon, lat) {
  const x = ((lon + 180) / 360) * 1000;
  const lr = Math.max(-85, Math.min(85, lat)) * (Math.PI / 180);
  const y = (500 / Math.PI) * (Math.PI - Math.log(Math.tan(Math.PI / 4 + lr / 2)));
  return [x, y];
}

function ringPath(ring) {
  return ring.map(([lon, lat], i) => {
    const [x, y] = mercator(lon, lat);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

function geomPath(g) {
  if (g.type === 'Polygon') return g.coordinates.map(ringPath).join(' ');
  if (g.type === 'MultiPolygon') return g.coordinates.map(p => p.map(ringPath).join(' ')).join(' ');
  return '';
}

let geoCache = null;

function useCountryPaths(passportCode, visas) {
  const [paths, setPaths] = useState([]);
  useEffect(() => {
    let cancelled = false;
    const build = data => {
      if (cancelled) return;
      setPaths(data.features.map(f => {
        const iso = (f.properties?.ISO_A2 || f.properties?.iso_a2 || '').toUpperCase();
        const name = f.properties?.ADMIN || f.properties?.name || iso;
        let status = 'unknown';
        if (passportCode && iso) {
          status = iso === passportCode.toUpperCase() ? 'home' : getVisaStatus(passportCode, iso, visas);
        }
        return { iso, name, status, color: STATUS_COLOR[status] ?? STATUS_COLOR.unknown, d: geomPath(f.geometry) };
      }));
    };
    if (geoCache) { build(geoCache); return; }
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(r => r.json()).then(d => { if (!cancelled) { geoCache = d; build(d); } }).catch(() => {});
    return () => { cancelled = true; };
  }, [passportCode, JSON.stringify(visas)]);
  return paths;
}

function InteractiveMap({ paths, width, height }) {
  const [tooltip, setTooltip] = useState(null);
  const tx = useRef(0), ty = useRef(0), sc = useRef(1);
  const [, redraw] = useState(0);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastPinch = useRef(null);
  const touchPts = useRef({});

  const clamp = (nx, ny, ns) => {
    const s = Math.max(1, Math.min(14, ns));
    return [Math.max(width - width * s, Math.min(0, nx)), Math.max(height - height * s, Math.min(0, ny)), s];
  };

  const applyZoom = (factor, cx, cy) => {
    const ns = Math.max(1, Math.min(14, sc.current * factor));
    const ratio = ns / sc.current;
    const [nx, ny, s] = clamp(cx - ratio * (cx - tx.current), cy - ratio * (cy - ty.current), ns);
    tx.current = nx; ty.current = ny; sc.current = s;
    redraw(n => n + 1);
  };

  const reset = () => { tx.current = 0; ty.current = 0; sc.current = 1; redraw(n => n + 1); };

  const onWheel = e => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    applyZoom(e.deltaY < 0 ? 1.25 : 1 / 1.25, e.clientX - r.left, e.clientY - r.top);
  };

  const onMouseDown = e => { dragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = e => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x, dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    const [nx, ny] = clamp(tx.current + dx, ty.current + dy, sc.current);
    tx.current = nx; ty.current = ny; redraw(n => n + 1);
  };
  const onMouseUp = () => { dragging.current = false; };

  const onTouchStart = e => {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => { touchPts.current[t.identifier] = { x: t.clientX, y: t.clientY }; });
    if (e.touches.length === 2) {
      const [a, b] = Array.from(e.touches);
      lastPinch.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }
  };
  const onTouchMove = e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0], prev = touchPts.current[t.identifier];
      if (prev) {
        const [nx, ny] = clamp(tx.current + (t.clientX - prev.x), ty.current + (t.clientY - prev.y), sc.current);
        tx.current = nx; ty.current = ny; redraw(n => n + 1);
      }
      touchPts.current[t.identifier] = { x: t.clientX, y: t.clientY };
    } else if (e.touches.length === 2) {
      const [a, b] = Array.from(e.touches);
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (lastPinch.current) {
        const r = e.currentTarget.getBoundingClientRect();
        applyZoom(dist / lastPinch.current, ((a.clientX + b.clientX) / 2) - r.left, ((a.clientY + b.clientY) / 2) - r.top);
      }
      lastPinch.current = dist;
      touchPts.current[a.identifier] = { x: a.clientX, y: a.clientY };
      touchPts.current[b.identifier] = { x: b.clientX, y: b.clientY };
    }
  };
  const onTouchEnd = e => {
    Array.from(e.changedTouches).forEach(t => { delete touchPts.current[t.identifier]; });
    if (e.touches.length < 2) lastPinch.current = null;
  };

  const s = sc.current;

  const handleCountryEnter = (e, c) => {
    const r = e.currentTarget.closest('[data-maproot]').getBoundingClientRect();
    setTooltip({ name: c.name, status: c.status, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const handleCountryMove = (e, c) => {
    const r = e.currentTarget.closest('[data-maproot]').getBoundingClientRect();
    setTooltip({ name: c.name, status: c.status, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      data-maproot
      style={{ position: 'relative', width, height, borderRadius: 12, overflow: 'hidden', background: '#cce8f4', cursor: dragging.current ? 'grabbing' : 'grab', userSelect: 'none', flexShrink: 0 }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { onMouseUp(); setTooltip(null); }}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <svg
        viewBox="0 0 1000 500"
        width={width}
        height={height}
        style={{
          display: 'block',
          transform: `translate(${tx.current}px,${ty.current}px) scale(${s})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          touchAction: 'none',
          pointerEvents: 'none',
        }}
      >
        {/* Ocean background */}
        <rect x="0" y="0" width="1000" height="500" fill="#cce8f4" />

        {paths.map(c => (
          <path
            key={c.iso}
            d={c.d}
            fill={c.color}
            stroke="#ffffff"
            strokeWidth={Math.max(0.2, 0.4 / s)}
            strokeLinejoin="round"
            style={{ pointerEvents: 'all', cursor: 'default' }}
            onMouseEnter={e => handleCountryEnter(e, c)}
            onMouseMove={e => handleCountryMove(e, c)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {/* Zoom buttons — bottom-left like VisaHQ */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 20 }}>
        <button onClick={() => applyZoom(1.5, width / 2, height / 2)}
          style={{ width: 30, height: 30, minWidth: 30, background: 'white', border: '1px solid #ccc', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#333', padding: 0 }}>
          +
        </button>
        <button onClick={() => applyZoom(1 / 1.5, width / 2, height / 2)}
          style={{ width: 30, height: 30, minWidth: 30, background: 'white', border: '1px solid #ccc', borderTop: 'none', borderRadius: '0 0 4px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#333', padding: 0 }}>
          −
        </button>
      </div>

      {/* Tooltip — dark card style like VisaHQ */}
      {tooltip && (
        <div style={{
          position: 'absolute', zIndex: 30, pointerEvents: 'none',
          left: Math.min(tooltip.x + 14, width - 230),
          top: Math.max(8, tooltip.y - 64),
          background: 'rgba(30,30,40,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '8px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          minWidth: 160,
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{tooltip.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[tooltip.status], flexShrink: 0 }} />
            <span style={{ color: '#d1d5db', fontSize: 12 }}>{STATUS_LABEL[tooltip.status]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SizedMap({ paths, aspectRatio = 2, fullHeight = false }) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState(null);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      const h = fullHeight ? Math.floor(entry.contentRect.height) : Math.floor(w / aspectRatio);
      setSize({ width: w, height: h });
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [aspectRatio, fullHeight]);

  return (
    <div ref={wrapRef} style={{ width: '100%', height: fullHeight ? '100%' : 'auto' }}>
      {size && size.width > 0 && size.height > 0
        ? <InteractiveMap paths={paths} width={size.width} height={size.height} />
        : <div style={{ height: 200 }} />}
    </div>
  );
}

export default function VisaMap({ passportCode, visas = [], expandable = true }) {
  const [fullscreen, setFullscreen] = useState(false);
  const paths = useCountryPaths(passportCode, visas);

  return (
    <>
      {/* Inline map */}
      <div style={{ position: 'relative', width: '100%' }}>
        {paths.length === 0 ? (
          <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#cce8f4', borderRadius: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid #38bdf8', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <SizedMap paths={paths} aspectRatio={2} />
        )}
        {expandable && paths.length > 0 && (
          <button onClick={() => setFullscreen(true)}
            style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, minWidth: 30, background: 'white', border: '1px solid #ccc', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
            <Maximize2 size={14} color="#374151" />
          </button>
        )}
      </div>



      {/* Fullscreen modal */}
      {fullscreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'white', flexShrink: 0 }}>
            {/* Legend in header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
              {LEGEND.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 11, height: 11, borderRadius: 3, background: item.color }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setFullscreen(false)}
              style={{ width: 34, height: 34, minWidth: 34, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>
              <X size={16} color="#374151" />
            </button>
          </div>

          {/* Map fills rest */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {paths.length > 0 && <SizedMap paths={paths} fullHeight />}
          </div>
        </div>
      )}
    </>
  );
}