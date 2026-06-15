"use client";

import { Particles, ParticlesProvider, useParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

async function initEngine(engine: Engine) {
  await loadSlim(engine);
}

const NASA_OPTIONS = {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: { value: 160, density: { enable: true } },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: {
      value: { min: 0, max: 1 },
      animation: { enable: true, speed: 1, sync: false },
    },
    size: { value: { min: 1, max: 3 } },
    links: { enable: false },
    move: {
      enable: true,
      speed: 2,
      direction: "none" as const,
      random: true,
      straight: false,
      outModes: { default: "out" as const },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "bubble" },
      onClick: { enable: true, mode: "repulse" },
    },
    modes: {
      bubble: { distance: 250, size: 0, duration: 2, opacity: 0 },
      repulse: { distance: 400, duration: 0.4 },
    },
  },
  detectRetina: true,
} as const;

function ParticlesCanvas() {
  const { loaded } = useParticlesProvider();
  if (!loaded) return null;
  return (
    <Particles
      id="tsparticles"
      options={NASA_OPTIONS}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    />
  );
}

export function ParticlesBackground() {
  return (
    <ParticlesProvider init={initEngine}>
      <ParticlesCanvas />
    </ParticlesProvider>
  );
}
