// @ts-nocheck
import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { getVisaStatus } from './Travelconstants';

// Cartoon-style status colors
// visa_free / has_visa  → green   (can go freely)
// evisa                 → sky blue (easy online visa)
// visa_on_arrival       → amber   (get visa at border)
// visa_required         → red     (need to apply in advance)
// own passport country  → gold    (home)
// unknown               → slate
const STATUS_COLOR_HEX = {
  visa_free:       0x22c55e, // green-500
  has_visa:        0x22c55e, // green-500  (same as visa_free)
  evisa:           0x38bdf8, // sky-400
  visa_on_arrival: 0xfbbf24, // amber-400
  visa_required:   0xf87171, // red-400
  home:            0xfcd34d, // amber-300 (passport country)
  unknown:         0x94a3b8, // slate-400
};

const STATUS_BORDER_HEX = {
  visa_free:       0x16a34a, // green-700
  has_visa:        0x16a34a,
  evisa:           0x0284c7, // sky-600
  visa_on_arrival: 0xd97706, // amber-600
  visa_required:   0xdc2626, // red-600
  home:            0xd97706, // amber-600
  unknown:         0x64748b, // slate-500
};

function latLonToVec3(lat, lon, r = 1) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function buildCountryMesh(ring, fillColor, radius = 1.003) {
  if (!ring || ring.length < 3) return null;
  const verts = ring.map(([lon, lat]) => latLonToVec3(lat, lon, radius));
  const cx = verts.reduce((s, v) => s + v.x, 0) / verts.length;
  const cy = verts.reduce((s, v) => s + v.y, 0) / verts.length;
  const cz = verts.reduce((s, v) => s + v.z, 0) / verts.length;
  const center = new THREE.Vector3(cx, cy, cz).normalize().multiplyScalar(radius);

  const positions = [];
  const n = verts.length;
  for (let i = 0; i < n; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % n];
    positions.push(center.x, center.y, center.z, a.x, a.y, a.z, b.x, b.y, b.z);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshToonMaterial({ color: fillColor });
  return new THREE.Mesh(geo, mat);
}

function buildBorderLine(ring, color, radius = 1.006) {
  if (!ring || ring.length < 2) return null;
  const points = ring.map(([lon, lat]) => latLonToVec3(lat, lon, radius));
  points.push(points[0]);
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
  return new THREE.LineLoop(geo, mat);
}

export default function VisaGlobe({ passportCode, visas = [], size = 220 }) {
  const mountRef   = useRef(null);
  const stateRef   = useRef({});
  const dragging   = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const vel        = useRef({ x: 0, y: 0 });
  const rot        = useRef({ x: 0.25, y: 0 });

  const build = useCallback(async () => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 2.9;

    // ── Toon gradient map (3-step) ─────────────────────────────────────────────
    const toonData = new Uint8Array([80, 160, 255]);
    const toonTex  = new THREE.DataTexture(toonData, 3, 1, THREE.RedFormat);
    toonTex.needsUpdate = true;

    // ── Ocean ──────────────────────────────────────────────────────────────────
    const oceanMat = new THREE.MeshToonMaterial({
      color: 0x38bdf8,        // sky-400 – cartoon ocean
      gradientMap: toonTex,
    });
    const ocean = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), oceanMat);

    // ── Specular gloss overlay (white sheen, top-left) ─────────────────────────
    const glossGeo = new THREE.SphereGeometry(1.001, 32, 32);
    const glossMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      shininess: 300,
      specular: new THREE.Color(0xffffff),
      side: THREE.FrontSide,
    });

    // ── Atmosphere rim (cartoon glow) ──────────────────────────────────────────
    const rimGeo = new THREE.SphereGeometry(1.07, 32, 32);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.13,
      side: THREE.BackSide,
    });

    const pivot = new THREE.Group();
    pivot.add(ocean);
    pivot.add(new THREE.Mesh(glossGeo, glossMat));
    scene.add(pivot);
    scene.add(new THREE.Mesh(rimGeo, rimMat)); // rim stays fixed

    // ── Lighting ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(5, 4, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbfdbfe, 0.4);
    fill.position.set(-3, -2, -2);
    scene.add(fill);

    // ── GeoJSON countries ──────────────────────────────────────────────────────
    try {
      const res  = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
      const data = await res.json();

      data.features.forEach(feature => {
        const iso = (feature.properties?.ISO_A2 || feature.properties?.iso_a2 || '').toUpperCase();
        let status = 'unknown';
        if (passportCode && iso) {
          if (iso === passportCode.toUpperCase()) {
            status = 'home';
          } else {
            status = getVisaStatus(passportCode, iso, visas);
          }
        }

        const fill   = STATUS_COLOR_HEX[status]  ?? STATUS_COLOR_HEX.unknown;
        const border = STATUS_BORDER_HEX[status] ?? STATUS_BORDER_HEX.unknown;

        const processPolygon = (coords) => {
          const ring = coords[0];
          const mesh = buildCountryMesh(ring, fill);
          if (mesh) pivot.add(mesh);
          const line = buildBorderLine(ring, border);
          if (line) pivot.add(line);
        };

        const g = feature.geometry;
        if (g.type === 'Polygon')      processPolygon(g.coordinates);
        else if (g.type === 'MultiPolygon') g.coordinates.forEach(processPolygon);
      });
    } catch (e) {
      console.warn('GeoJSON failed', e);
    }

    stateRef.current = { renderer, scene, camera, pivot };

    // ── Animate ────────────────────────────────────────────────────────────────
    const tick = () => {
      const s = stateRef.current;
      if (!s.renderer) return;
      s.animId = requestAnimationFrame(tick);

      if (!dragging.current) {
        vel.current.x *= 0.90;
        vel.current.y *= 0.90;
        rot.current.y += vel.current.y + 0.005;
        rot.current.x = Math.max(-1.1, Math.min(1.1, rot.current.x + vel.current.x));
      }
      s.pivot.rotation.y = rot.current.y;
      s.pivot.rotation.x = rot.current.x;
      s.renderer.render(s.scene, s.camera);
    };
    tick();
  }, [passportCode, JSON.stringify(visas), size]);

  useEffect(() => {
    build();
    return () => {
      const s = stateRef.current;
      if (s.animId) cancelAnimationFrame(s.animId);
      if (s.renderer) { s.renderer.dispose(); s.renderer.domElement?.remove(); }
      stateRef.current = {};
    };
  }, [build]);

  const onDown = (e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    vel.current.y = dx * 0.007;
    vel.current.x = dy * 0.007;
    rot.current.y += dx * 0.007;
    rot.current.x = Math.max(-1.1, Math.min(1.1, rot.current.x + dy * 0.007));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { dragging.current = false; };

  return (
    <div
      ref={mountRef}
      className="cursor-grab active:cursor-grabbing select-none"
      style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    />
  );
}