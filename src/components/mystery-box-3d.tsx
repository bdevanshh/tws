"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent, type TransitionEvent } from "react";
import { ChevronsUp, KeyRound, Rotate3d } from "lucide-react";
import styles from "./mystery-box-3d.module.css";
import { RarityBadge } from "./rarity-badge";
import { RARITY_META } from "@/lib/data";
import type { Rarity } from "@/lib/types";
import { cn } from "@/lib/utils";

export type RitualStage =
  | "locked"
  | "ready"
  | "lifting"
  | "reveal1"
  | "reveal2"
  | "revealed";

export interface BoxPrize {
  emoji: string;
  name: string;
  rarity: Rarity;
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  angle: `${i * 20}deg`,
  dist: `${110 + (i % 4) * 32}px`,
  delay: `${0.4 + (i % 9) * 0.07}s`,
}));

/** Upward drag distance (px) that fully swings the hinged lid. */
const DRAG_FULL = 220;
/** Release past this openness snaps open; otherwise snaps shut. */
const DRAG_THRESHOLD = 0.45;
/** Hinge swing of the lid when fully open (past vertical, leaning back). */
const OPEN_ANGLE = 108;

const HOME_RY = -24;
const HOME_RX = -13;
const ZOOM_OPEN = 1.32;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function MysteryBox3D({
  stage,
  locks,
  onBreakLock,
  prize,
  tierName,
  suspense,
  onOpened,
}: {
  stage: RitualStage;
  locks: boolean[];
  onBreakLock: (index: number) => void;
  prize: BoxPrize | null;
  tierName: string;
  suspense: string | null;
  onOpened: () => void;
}) {
  const lidOpen =
    stage === "lifting" || stage === "reveal1" || stage === "reveal2" || stage === "revealed";
  const reveal = stage === "reveal1" ? 1 : stage === "reveal2" ? 2 : stage === "revealed" ? 3 : 0;
  const accent = prize ? RARITY_META[prize.rarity].color : "#e9b44c";

  const sceneRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const hingeRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    sx: number;
    sy: number;
    ry: number;
    rx: number;
    mode: null | "spin" | "lid";
  } | null>(null);
  const rot = useRef({ ry: HOME_RY, rx: HOME_RX });
  const lidT = useRef(0);
  const zoom = useRef(1);
  const pendingSnap = useRef<0 | 1 | null>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSnapTimer = () => {
    if (snapTimer.current) {
      clearTimeout(snapTimer.current);
      snapTimer.current = null;
    }
  };

  useEffect(() => () => clearSnapTimer(), []);

  const applyAll = () => {
    const o = orbitRef.current;
    const h = hingeRef.current;
    const s = sceneRef.current;
    if (o)
      o.style.transform = `rotateX(${rot.current.rx}deg) rotateY(${rot.current.ry}deg) scale(${zoom.current})`;
    if (h)
      h.style.transform = `translateY(calc(var(--bh) / -2)) rotateX(${-OPEN_ANGLE * lidT.current}deg)`;
    s?.style.setProperty("--open", String(lidT.current));
  };

  /* Stage-driven camera + hinge: snap shut on fresh reset, glide open + push in on reveal. */
  useEffect(() => {
    const s = sceneRef.current;
    s?.classList.remove(styles.dragging);
    drag.current = null;
    clearSnapTimer();
    if (hingeRef.current) hingeRef.current.style.transition = "";
    if (orbitRef.current) orbitRef.current.style.transition = "";
    pendingSnap.current = null;
    if (lidOpen) {
      lidT.current = 1;
      zoom.current = ZOOM_OPEN;
    } else if (stage === "locked" && locks.every((b) => !b)) {
      lidT.current = 0;
      zoom.current = 1;
      rot.current = { ry: HOME_RY, rx: HOME_RX };
    }
    applyAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const spinAllowed = stage !== "lifting";
  const lidAllowed = stage === "ready";
  const nextLock = stage === "locked" ? locks.findIndex((b) => !b) : -1;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) return;
    if ((e.target as HTMLElement).closest("button")) return;
    if (!spinAllowed && !lidAllowed) return;
    clearSnapTimer();
    drag.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ry: rot.current.ry,
      rx: rot.current.rx,
      mode: null,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    sceneRef.current?.classList.add(styles.dragging);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (d.mode === null) {
      if (lidAllowed && -dy > 14 && Math.abs(dy) > Math.abs(dx) * 1.15) d.mode = "lid";
      else if (Math.hypot(dx, dy) > 6) d.mode = "spin";
      else return;
    }
    if (d.mode === "lid") {
      lidT.current = clamp((d.sy - e.clientY) / DRAG_FULL, 0, 1);
      applyAll();
    } else {
      // A spin that turns into a clear upward pull becomes a lid drag.
      // lidT is derived from absolute finger position, so the handoff is seamless.
      if (lidAllowed && -dy > 40 && -dy > Math.abs(dx)) {
        d.mode = "lid";
        lidT.current = clamp((d.sy - e.clientY) / DRAG_FULL, 0, 1);
        applyAll();
        return;
      }
      rot.current.ry = clamp(d.ry + dx * 0.32, -70, 70);
      rot.current.rx = clamp(d.rx - dy * 0.16, -32, 10);
      applyAll();
    }
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    sceneRef.current?.classList.remove(styles.dragging);
    if (d.mode !== "lid" || !hingeRef.current) return;
    const t = lidT.current;
    const hinge = hingeRef.current;
    if (t >= DRAG_THRESHOLD) {
      lidT.current = 1;
      zoom.current = 1.12;
      if (t >= 0.999) {
        // Finger already dragged the lid fully open: rewriting the same
        // transform starts no transition (and fires no transitionend),
        // so hand off to the reveal directly.
        applyAll();
        onOpened();
        return;
      }
      pendingSnap.current = 1;
      hinge.style.transition = "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)";
      // Fallback — if the transitionend event is ever swallowed, still reveal.
      snapTimer.current = setTimeout(() => {
        if (pendingSnap.current === 1) {
          pendingSnap.current = null;
          if (hingeRef.current) hingeRef.current.style.transition = "";
          onOpened();
        }
      }, 750);
    } else {
      pendingSnap.current = 0;
      hinge.style.transition = "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)";
      lidT.current = 0;
    }
    applyAll();
  };

  const onHingeTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== hingeRef.current || pendingSnap.current === null) return;
    const target = pendingSnap.current;
    pendingSnap.current = null;
    clearSnapTimer();
    if (hingeRef.current) hingeRef.current.style.transition = "";
    if (target === 1) onOpened();
  };

  return (
    <div
      ref={sceneRef}
      className={cn(styles.scene, (spinAllowed || lidAllowed) && styles.touchNone)}
      style={{ "--accent": accent } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className={cn(styles.burst, reveal >= 1 && styles.burstOn)} />
      <div className={cn(styles.rays, reveal >= 3 && styles.raysOn)} />
      {reveal >= 2 && <div className={styles.halo} />}
      <div className={styles.beam} />
      <div className={styles.leak} />

      <div className={styles.stage}>
        <div className={styles.orbit} ref={orbitRef}>
          <div className={styles.float}>
            <div className={cn(styles.chest, stage === "lifting" && styles.rumbling)}>
              {/* ---- chest base ---- */}
              <div className={styles.baseBox}>
                <div className={cn(styles.face, styles.wood, styles.bBack)} />
                <div className={cn(styles.face, styles.woodSide, styles.bLeft)} />
                <div className={cn(styles.face, styles.woodSide, styles.bRight)} />
                <div className={cn(styles.face, styles.woodDark, styles.bBottom)} />
                <div className={cn(styles.face, styles.mouth)} />
                <div className={cn(styles.face, styles.wood, styles.bFront)}>
                  <span className={cn(styles.strapV, styles.strapLeft)} aria-hidden />
                  <span className={cn(styles.strapV, styles.strapRight)} aria-hidden />
                  <div className={styles.plaque}>
                    <div className={styles.plaqueTitle}>{tierName}</div>
                    <div className={styles.plaqueSub}>Mystery Chest</div>
                  </div>
                  {locks.map((broken, i) => (
                    <div
                      key={i}
                      className={cn(styles.lockUnit, i === 0 ? styles.unitLeft : styles.unitRight)}
                    >
                      <span className={styles.plate} aria-hidden />
                      <button
                        type="button"
                        aria-label={broken ? `Padlock ${i + 1} open` : `Pick padlock ${i + 1}`}
                        disabled={broken || stage !== "locked"}
                        onClick={() => onBreakLock(i)}
                        className={cn(
                          styles.padlock,
                          broken && styles.unlocked,
                          i === nextLock && styles.next
                        )}
                      >
                        <span className={styles.shackle} aria-hidden />
                        <span className={styles.pbody} aria-hidden>
                          <span className={styles.keyhole} aria-hidden />
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- hinged lid (pivot at back-bottom edge) ---- */}
              <div ref={hingeRef} onTransitionEnd={onHingeTransitionEnd} className={styles.lidBox}>
                <div className={cn(styles.face, styles.wood, styles.lBack)} />
                <div className={cn(styles.face, styles.woodSide, styles.lLeft)} />
                <div className={cn(styles.face, styles.woodSide, styles.lRight)} />
                <div className={cn(styles.face, styles.woodTop, styles.lTop)} />
                <div className={cn(styles.face, styles.lidUnder)} />
                <div className={cn(styles.face, styles.wood, styles.lFront)}>
                  <span className={cn(styles.lidStrap, styles.strapLeft)} aria-hidden>
                    <span className={styles.haspSlot} aria-hidden />
                  </span>
                  <span className={cn(styles.lidStrap, styles.strapRight)} aria-hidden>
                    <span className={styles.haspSlot} aria-hidden />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reveal >= 3 && (
        <div className={styles.particlesOn}>
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={styles.particle}
              style={{ "--a": p.angle, "--d": p.dist, animationDelay: p.delay } as CSSProperties}
            />
          ))}
        </div>
      )}

      {stage === "locked" && (
        <div className={styles.hintBar}>
          <span className={styles.hintChip}>
            <Rotate3d size={14} /> Drag to rotate
          </span>
          <span className={cn(styles.hintChip, styles.hintGold)}>
            <KeyRound size={14} /> Tap a padlock to pick it
          </span>
        </div>
      )}

      {lidAllowed && (
        <div className={styles.swipeHint}>
          <span className={styles.chevs}>
            <ChevronsUp size={30} />
          </span>
          Swipe up to open the chest
        </div>
      )}

      {reveal >= 1 && prize && (
        <div className={styles.prize}>
          <div
            className={cn(
              reveal >= 3 && styles.prizeBob,
              reveal === 1 ? styles.prizeGhost : reveal === 2 ? styles.prizeFocus : styles.prizeFull
            )}
          >
            <div className={styles.prizeEmoji}>{prize.emoji}</div>
            {reveal >= 3 && (
              <div className={styles.prizeMeta}>
                <div className={styles.prizeName}>{prize.name}</div>
                <RarityBadge rarity={prize.rarity} />
              </div>
            )}
          </div>
        </div>
      )}

      {suspense && (
        <div key={suspense} className={styles.suspense}>
          {suspense}
        </div>
      )}

      <div className={styles.floor} />
    </div>
  );
}
