// components/PurpleEliteSoldier.tsx
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * PurpleEliteSoldier
 * A professional, minimal, matte-finish low-poly / voxel-style 3D character
 * viewer. Engineering-hardware aesthetic: brushed metal, muted tones, no
 * emissive glow / neon accents. Fully transparent background so it can be
 * dropped onto any surface.
 */

// ---------------------------------------------------------------------------
// Design tokens — engineered from the supplied triad
//   e2d1fe (pale lavender) · 2b0b55 (deep plum) · 7c32be (violet)
// Applied as a matte anodized-metal finish: high roughness, restrained
// metalness, zero emissive. The lavender is used sparingly, as a machined
// trim highlight, never as a fill color — that's what keeps it reading as
// hardware rather than a glowing/neon toy.
// ---------------------------------------------------------------------------
const PALETTE = {
  hullDark: 0x2b0b55,   // deep plum — primary armor plating, dark
  hull: 0x421c73,       // primary armor plating, mid (blend of plum + violet)
  hullLight: 0x7c32be,  // violet — secondary plating / raised panels
  panel: 0x9a63d1,      // lighter violet — panel highlights, shins/forearms
  joint: 0x140a29,      // near-black plum — connectors, boots, gloves, neck
  trim: 0xe2d1fe,       // pale lavender — machined trim band, used sparingly
  glass: 0x1c1030,      // matte visor / optical glass, unlit
  accent: 0x5c4a80,     // muted plum-gray — chest data plate, unlit
} as const;

interface AddBoxOptions {
  w: number;
  h: number;
  d: number;
  x: number;
  y: number;
  z: number;
  color: number;
  rx?: number;
  ry?: number;
  rz?: number;
  metalness?: number;
  roughness?: number;
}

interface CharacterGroup extends THREE.Group {
  userData: {
    chestPlate: THREE.Mesh;
    [key: string]: unknown;
  };
}

function addBox(group: THREE.Group, options: AddBoxOptions): THREE.Mesh {
  const {
    w, h, d, x, y, z, color, rx = 0, ry = 0, rz = 0,
    metalness = 0.4, roughness = 0.6,
  } = options;

  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    metalness,
    roughness,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function buildCharacter(): CharacterGroup {
  const root = new THREE.Group() as CharacterGroup;
  const P = PALETTE;

  // ---------- legs ----------
  [-1, 1].forEach((side) => {
    const x = side * 0.27;
    addBox(root, { w: 0.46, h: 0.28, d: 0.7, x, y: 0.14, z: 0.04, color: P.joint, metalness: 0.5, roughness: 0.5 });
    addBox(root, { w: 0.4, h: 0.5, d: 0.4, x, y: 0.53, z: 0, color: P.hull });
    addBox(root, { w: 0.46, h: 0.22, d: 0.3, x, y: 0.76, z: 0.22, color: P.panel, metalness: 0.3, roughness: 0.65 });
    addBox(root, { w: 0.44, h: 0.42, d: 0.44, x, y: 1.03, z: 0, color: P.hullDark });
    addBox(root, { w: 0.18, h: 0.2, d: 0.1, x: x * 1.15, y: 0.98, z: 0.27, color: P.joint, metalness: 0.5, roughness: 0.45 });
  });

  // ---------- hip / pelvis ----------
  addBox(root, { w: 0.95, h: 0.22, d: 0.46, x: 0, y: 1.3, z: 0, color: P.hull });
  addBox(root, { w: 0.98, h: 0.06, d: 0.48, x: 0, y: 1.4, z: 0, color: P.trim, metalness: 0.75, roughness: 0.3 });

  // ---------- torso ----------
  addBox(root, { w: 0.7, h: 0.3, d: 0.42, x: 0, y: 1.58, z: 0.02, color: P.hull });
  addBox(root, { w: 0.86, h: 0.44, d: 0.48, x: 0, y: 1.96, z: 0, color: P.hull });
  addBox(root, { w: 0.9, h: 0.05, d: 0.5, x: 0, y: 2.17, z: 0, color: P.trim, metalness: 0.75, roughness: 0.3 });
  // chest plate — a flush data/registration panel, matte, unlit
  const chestPlate = addBox(root, {
    w: 0.16, h: 0.16, d: 0.05, x: 0, y: 1.96, z: 0.25, color: P.accent,
    metalness: 0.2, roughness: 0.4,
  });

  // backpack
  addBox(root, { w: 0.5, h: 0.5, d: 0.22, x: 0, y: 1.98, z: -0.34, color: P.joint, metalness: 0.5, roughness: 0.5 });

  // shoulders
  [-1, 1].forEach((side) => {
    const x = side * 0.56;
    addBox(root, { w: 0.32, h: 0.28, d: 0.4, x, y: 2.1, z: 0.02, color: P.panel, metalness: 0.3, roughness: 0.65 });
    addBox(root, { w: 0.34, h: 0.06, d: 0.42, x, y: 2.24, z: 0.02, color: P.trim, metalness: 0.75, roughness: 0.3 });
  });

  // ---------- arms ----------
  [-1, 1].forEach((side) => {
    addBox(root, { w: 0.24, h: 0.4, d: 0.26, x: side * 0.58, y: 1.83, z: 0.14, rx: -0.35, color: P.hull });
    addBox(root, { w: 0.22, h: 0.36, d: 0.24, x: side * 0.4, y: 1.63, z: 0.52, rx: -0.95, color: P.panel, metalness: 0.3, roughness: 0.65 });
    addBox(root, { w: 0.17, h: 0.16, d: 0.2, x: side * 0.3, y: 1.6, z: 0.76, color: P.joint, metalness: 0.5, roughness: 0.5 });
  });

  // ---------- neck + head ----------
  addBox(root, { w: 0.22, h: 0.12, d: 0.22, x: 0, y: 2.22, z: 0, color: P.joint, metalness: 0.5, roughness: 0.5 });
  addBox(root, { w: 0.5, h: 0.2, d: 0.52, x: 0, y: 2.34, z: 0.02, color: P.hull });
  addBox(root, { w: 0.52, h: 0.34, d: 0.56, x: 0, y: 2.6, z: 0, color: P.hull });
  addBox(root, {
    w: 0.08, h: 0.06, d: 0.32, x: 0, y: 2.78, z: 0.05,
    color: P.trim, metalness: 0.75, roughness: 0.3,
  });

  // visor — matte tinted glass, unlit
  addBox(root, { w: 0.44, h: 0.17, d: 0.08, x: 0, y: 2.38, z: 0.28, color: P.joint, metalness: 0.55, roughness: 0.35 });
  addBox(root, {
    w: 0.36, h: 0.1, d: 0.03, x: 0, y: 2.38, z: 0.32,
    color: P.glass, metalness: 0.15, roughness: 0.25,
  });

  // comm unit
  addBox(root, { w: 0.1, h: 0.14, d: 0.14, x: 0.29, y: 2.48, z: 0.04, color: P.joint, metalness: 0.5, roughness: 0.5 });
  addBox(root, { w: 0.04, h: 0.1, d: 0.04, x: 0.29, y: 2.58, z: 0.04, color: P.trim, metalness: 0.75, roughness: 0.3 });

  // ---------- weapon ----------
  const gun = new THREE.Group();
  addBox(gun, { w: 0.14, h: 0.16, d: 0.55, x: 0.03, y: 0, z: 0, color: P.joint, metalness: 0.55, roughness: 0.4 });
  addBox(gun, { w: 0.06, h: 0.06, d: 0.35, x: 0.03, y: 0.02, z: 0.4, color: P.hullLight, metalness: 0.5, roughness: 0.4 });
  addBox(gun, { w: 0.12, h: 0.14, d: 0.22, x: 0.03, y: -0.02, z: -0.35, color: P.hull });
  addBox(gun, { w: 0.1, h: 0.26, d: 0.12, x: 0.03, y: -0.19, z: -0.08, rz: 0.12, color: P.hullDark });
  addBox(gun, { w: 0.06, h: 0.05, d: 0.3, x: 0.03, y: 0.11, z: 0, color: P.trim, metalness: 0.75, roughness: 0.3 });
  addBox(gun, { w: 0.08, h: 0.14, d: 0.08, x: 0.03, y: -0.15, z: 0.2, color: P.hullDark });
  gun.position.set(0.06, 1.66, 0.85);
  root.add(gun);

  root.userData.chestPlate = chestPlate;
  return root;
}

type PointerLikeEvent = PointerEvent | TouchEvent;

export default function PurpleEliteSoldier(): ReactElement {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // fully transparent
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // ---------------------------------------------------------------
    // Lighting — neutral, three-point studio setup. No colored/neon
    // accent lights, no point-light "glow" sources.
    // ---------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xdfe4ea, 0.5);
    fill.position.set(-4, 2.5, -2);
    scene.add(fill);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
    rimLight.position.set(0, 3, -5);
    scene.add(rimLight);

    // character
    const character = buildCharacter();
    scene.add(character);

    // pedestal — plain brushed-metal disc, no emissive ring
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.25, 0.1, 32),
      new THREE.MeshStandardMaterial({ color: 0x1c1e22, metalness: 0.55, roughness: 0.4 })
    );
    pedestal.position.y = -0.05;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // subtle machined groove on the pedestal for an engineered look
    const grooveGeo = new THREE.TorusGeometry(1.02, 0.012, 8, 64);
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x0f1013, metalness: 0.3, roughness: 0.7 });
    const groove = new THREE.Mesh(grooveGeo, grooveMat);
    groove.rotation.x = Math.PI / 2;
    groove.position.y = 0.001;
    scene.add(groove);

    // ---------------------------------------------------------------
    // Camera controls (orbit / drag / zoom)
    // ---------------------------------------------------------------
    const target = new THREE.Vector3(0, 1.35, 0);
    const radius = 4.2; // fixed camera distance — no scroll/zoom interaction
    let theta = 0.6; // azimuth
    let phi = 1.15; // polar
    let autoRotate = true;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    function updateCamera(): void {
      const sinPhi = Math.sin(phi);
      camera.position.x = target.x + radius * sinPhi * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * sinPhi * Math.cos(theta);
      camera.lookAt(target);
    }
    updateCamera();

    function getClientCoords(e: PointerLikeEvent): { x: number; y: number } {
      if ("touches" in e && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      const pe = e as PointerEvent;
      return { x: pe.clientX, y: pe.clientY };
    }

    function onPointerDown(e: PointerLikeEvent): void {
      dragging = true;
      autoRotate = false;
      renderer.domElement.style.cursor = "grabbing";
      const { x, y } = getClientCoords(e);
      lastX = x;
      lastY = y;
    }
    function onPointerMove(e: PointerLikeEvent): void {
      if (!dragging) return;
      const { x: cx, y: cy } = getClientCoords(e);
      const dx = cx - lastX;
      const dy = cy - lastY;
      lastX = cx;
      lastY = cy;
      theta -= dx * 0.008;
      phi = Math.min(Math.max(phi - dy * 0.008, 0.5), 1.5);
      updateCamera();
    }
    function onPointerUp(): void {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    }

    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";
    dom.addEventListener("pointerdown", onPointerDown as EventListener);
    window.addEventListener("pointermove", onPointerMove as EventListener);
    window.addEventListener("pointerup", onPointerUp);

    function onResize(): void {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", onResize);

    // ---------------------------------------------------------------
    // Animation loop — gentle auto-rotate + a barely-there idle bob.
    // No color pulsing, no emissive flicker, no particles.
    // ---------------------------------------------------------------
    let frameId: number;
    const clock = new THREE.Clock();
    function animate(): void {
      const t = clock.getElapsedTime();
      if (autoRotate && !dragging) {
        theta += 0.0035;
        updateCamera();
      }
      character.position.y = Math.sin(t * 1.4) * 0.018;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();
    setReady(true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove as EventListener);
      window.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointerdown", onPointerDown as EventListener);
      renderer.dispose();
      if (mount.contains(dom)) mount.removeChild(dom);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "transparent",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%", background: "transparent" }} />
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8a8f97",
            fontSize: 12,
            letterSpacing: "0.04em",
            background: "transparent",
          }}
        >
          Loading model…
        </div>
      )}
    </div>
  );
}