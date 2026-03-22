import { useEffect, useRef } from "react";

type DustParticle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	alphaBase: number;
	alphaAmp: number;
	phase: number;
	phaseSpeed: number;
	color: [number, number, number];
};

type GlowOrb = {
	baseX: number;
	baseY: number;
	radius: number;
	driftX: number;
	driftY: number;
	speed: number;
	phase: number;
	color: [number, number, number];
	alpha: number;
};

const DUST_COLORS: Array<[number, number, number]> = [
	[34, 211, 238],
	[34, 197, 94],
	[255, 255, 255],
];

const ORB_COLORS: Array<[number, number, number]> = [
	[34, 211, 238],
	[34, 197, 94],
	[16, 185, 129],
];

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function rand(min: number, max: number) {
	return min + Math.random() * (max - min);
}

export default function ParticleBackground() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		let rafId = 0;
		let width = 0;
		let height = 0;
		let dust: DustParticle[] = [];
		let orbs: GlowOrb[] = [];

		const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
		const pointer = {
			x: 0,
			y: 0,
			active: false,
			smoothX: 0,
			smoothY: 0,
		};

		const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

		const rebuild = () => {
			const area = width * height;
			const count = clamp(Math.floor(area / 14500), 80, 190);

			dust = Array.from({ length: count }, () => {
				const c = DUST_COLORS[Math.floor(rand(0, DUST_COLORS.length))];
				return {
					x: rand(0, width),
					y: rand(0, height),
					vx: rand(-0.055, 0.055),
					vy: rand(-0.055, 0.055),
					size: rand(1.4, 3.8),
					alphaBase: rand(0.16, 0.4),
					alphaAmp: rand(0.02, 0.1),
					phase: rand(0, Math.PI * 2),
					phaseSpeed: rand(0.0025, 0.009),
					color: c,
				};
			});

			const orbCount = width < 640 ? 2 : 3;
			orbs = Array.from({ length: orbCount }, (_, i) => {
				const c = ORB_COLORS[i % ORB_COLORS.length];
				return {
					baseX: rand(width * 0.12, width * 0.88),
					baseY: rand(height * 0.12, height * 0.88),
					radius: rand(140, 230),
					driftX: rand(24, 56),
					driftY: rand(20, 48),
					speed: rand(0.0015, 0.0035),
					phase: rand(0, Math.PI * 2),
					color: c,
					alpha: rand(0.06, 0.12),
				};
			});
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;

			canvas.width = Math.floor(width * dpr);
			canvas.height = Math.floor(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			rebuild();
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!hasFinePointer) return;
			pointer.x = event.clientX;
			pointer.y = event.clientY;
			pointer.active = true;
		};

		const onPointerLeave = () => {
			pointer.active = false;
		};

		const drawOrbs = (time: number) => {
			for (let i = 0; i < orbs.length; i += 1) {
				const orb = orbs[i];
				const t = time * orb.speed + orb.phase;
				const ox = orb.baseX + Math.cos(t) * orb.driftX;
				const oy = orb.baseY + Math.sin(t * 1.2) * orb.driftY;

				const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.radius);
				const [r, g, b] = orb.color;
				gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${orb.alpha})`);
				gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.55})`);
				gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

				ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.arc(ox, oy, orb.radius, 0, Math.PI * 2);
				ctx.fill();
			}
		};

		const animate = (now: number) => {
			ctx.clearRect(0, 0, width, height);

			if (hasFinePointer && pointer.active) {
				pointer.smoothX += (pointer.x - pointer.smoothX) * 0.06;
				pointer.smoothY += (pointer.y - pointer.smoothY) * 0.06;
			}

			drawOrbs(now);

			for (let i = 0; i < dust.length; i += 1) {
				const p = dust[i];
				p.x += p.vx;
				p.y += p.vy;

				if (p.x < -8) p.x = width + 8;
				if (p.x > width + 8) p.x = -8;
				if (p.y < -8) p.y = height + 8;
				if (p.y > height + 8) p.y = -8;

				if (hasFinePointer && pointer.active) {
					const dx = p.x - pointer.smoothX;
					const dy = p.y - pointer.smoothY;
					const distSq = dx * dx + dy * dy;
					const radius = 180;
					const radiusSq = radius * radius;

					if (distSq < radiusSq && distSq > 0.001) {
						const dist = Math.sqrt(distSq);
						const strength = (1 - dist / radius) * 0.008;
						p.x += (dx / dist) * strength * 18;
						p.y += (dy / dist) * strength * 18;
					}
				}

				p.phase += p.phaseSpeed;
				const a = clamp(p.alphaBase + Math.sin(p.phase) * p.alphaAmp, 0.1, 0.5);
				const [r, g, b] = p.color;
				const color = `rgba(${r}, ${g}, ${b}, ${a})`;

				ctx.fillStyle = color;
				ctx.shadowColor = color;
				ctx.shadowBlur = 7;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.shadowBlur = 0;
			rafId = window.requestAnimationFrame(animate);
		};

		resize();
		rafId = window.requestAnimationFrame(animate);

		window.addEventListener("resize", resize);
		window.addEventListener("pointermove", onPointerMove, { passive: true });
		window.addEventListener("pointerleave", onPointerLeave, { passive: true });

		return () => {
			window.cancelAnimationFrame(rafId);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerleave", onPointerLeave);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 h-full w-full z-0"
			aria-hidden="true"
		/>
	);
}

