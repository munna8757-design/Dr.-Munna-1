import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OutfitType, AvatarMode } from '../types';
import { RotateCw, Sparkles, ZoomIn, ZoomOut, Activity, User, ShieldCheck } from 'lucide-react';

interface Avatar3DProps {
  onOutfitChange?: (outfit: OutfitType) => void;
  className?: string;
  height?: number | string;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ onOutfitChange, className = '', height = 360 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentOutfit, setCurrentOutfit] = useState<OutfitType>('sari');
  const [viewMode, setViewMode] = useState<AvatarMode>('human');
  const [isRotating, setIsRotating] = useState(true);

  const rootGroupRef = useRef<THREE.Group | null>(null);
  const humanGroupRef = useRef<THREE.Group | null>(null);
  const organGroupRef = useRef<THREE.Group | null>(null);
  const skeletonGroupRef = useRef<THREE.Group | null>(null);

  const bodyMeshRef = useRef<THREE.Mesh | null>(null);
  const waistMeshRef = useRef<THREE.Mesh | null>(null);
  const scarfMeshRef = useRef<THREE.Mesh | null>(null);
  const drapeMeshRef = useRef<THREE.Mesh | null>(null);
  const legLRef = useRef<THREE.Mesh | null>(null);
  const legRRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151d33);
    scene.fog = new THREE.Fog(0x151d33, 6, 16);

    const width = container.clientWidth || 320;
    const h = typeof height === 'number' ? height : container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(34, width / h, 0.1, 100);
    camera.position.set(0, 1.55, 6.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, h);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.replaceChildren(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xcfe5ff, 0x503e63, 2.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe4d1, 3.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x61e7f5, 2.5);
    rimLight.position.set(-3, 2, 1);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xb59bff, 1.2);
    fillLight.position.set(0, 2, -3);
    scene.add(fillLight);

    // Root model group
    const root = new THREE.Group();
    scene.add(root);
    rootGroupRef.current = root;

    // Subgroups for Human vs Organ vs Skeleton views
    const humanGroup = new THREE.Group();
    const organGroup = new THREE.Group();
    const skeletonGroup = new THREE.Group();
    root.add(humanGroup);
    root.add(organGroup);
    root.add(skeletonGroup);
    humanGroupRef.current = humanGroup;
    organGroupRef.current = organGroup;
    skeletonGroupRef.current = skeletonGroup;
    organGroup.visible = false;
    skeletonGroup.visible = false;

    // Materials
    const mat = (color: number, roughness = 0.65, metalness = 0.1) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });

    const skin = mat(0xc88d6d);
    const hair = mat(0x201821, 0.8);
    const white = mat(0xf4f0ed, 0.3);
    const eye = mat(0x18131a, 0.2);
    const lip = mat(0x9b394a, 0.5);

    function createMesh(
      parent: THREE.Group,
      geo: THREE.BufferGeometry,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      sx = 1,
      sy = 1,
      sz = 1
    ) {
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(x, y, z);
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    const sphereGeo = new THREE.SphereGeometry(1, 28, 22);
    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 24);
    const torsoGeo = new THREE.CapsuleGeometry(0.42, 0.68, 6, 16);

    // ================= Human Group =================
    createMesh(humanGroup, sphereGeo, skin, 0, 1.75, 0, 0.34, 0.43, 0.31); // Face
    createMesh(humanGroup, sphereGeo, hair, 0, 2.01, -0.055, 0.37, 0.29, 0.34); // Hair
    createMesh(humanGroup, sphereGeo, hair, -0.27, 1.79, -0.01, 0.12, 0.38, 0.14);
    createMesh(humanGroup, sphereGeo, hair, 0.27, 1.79, -0.01, 0.12, 0.38, 0.14);
    createMesh(humanGroup, sphereGeo, hair, 0, 1.78, -0.22, 0.3, 0.38, 0.2);

    createMesh(humanGroup, sphereGeo, white, -0.12, 1.78, 0.275, 0.065, 0.045, 0.035);
    createMesh(humanGroup, sphereGeo, white, 0.12, 1.78, 0.275, 0.065, 0.045, 0.035);
    createMesh(humanGroup, sphereGeo, eye, -0.12, 1.78, 0.306, 0.025, 0.034, 0.016);
    createMesh(humanGroup, sphereGeo, eye, 0.12, 1.78, 0.306, 0.025, 0.034, 0.016);
    createMesh(humanGroup, sphereGeo, skin, 0, 1.69, 0.3, 0.045, 0.07, 0.04);
    createMesh(humanGroup, sphereGeo, lip, 0, 1.6, 0.29, 0.075, 0.022, 0.025);

    createMesh(humanGroup, cylGeo, skin, 0, 1.31, 0, 0.12, 0.25, 0.12); // Neck

    const bodyMat = mat(0x9b3d83);
    const bodyMesh = createMesh(humanGroup, torsoGeo, bodyMat, 0, 0.77, 0, 0.93, 0.95, 0.67);
    bodyMeshRef.current = bodyMesh;

    const waistMesh = createMesh(humanGroup, cylGeo, bodyMat.clone(), 0, 0.29, 0, 0.42, 0.65, 0.28);
    waistMeshRef.current = waistMesh;

    const leftArm = createMesh(humanGroup, cylGeo, skin, -0.51, 0.76, 0, 0.12, 0.75, 0.12);
    leftArm.rotation.z = -0.18;
    const rightArm = createMesh(humanGroup, cylGeo, skin, 0.51, 0.76, 0, 0.12, 0.75, 0.12);
    rightArm.rotation.z = 0.18;
    createMesh(humanGroup, sphereGeo, skin, -0.52, 0.35, 0.02, 0.13, 0.14, 0.13);
    createMesh(humanGroup, sphereGeo, skin, 0.52, 0.35, 0.02, 0.13, 0.14, 0.13);

    const legMat = mat(0x313c64);
    const legL = createMesh(humanGroup, cylGeo, legMat, -0.19, -0.25, 0, 0.15, 0.78, 0.17);
    const legR = createMesh(humanGroup, cylGeo, legMat.clone(), 0.19, -0.25, 0, 0.15, 0.78, 0.17);
    legLRef.current = legL;
    legRRef.current = legR;

    const shoeMat = mat(0x25263a);
    createMesh(humanGroup, sphereGeo, shoeMat, -0.19, -0.68, 0.09, 0.19, 0.11, 0.31);
    createMesh(humanGroup, sphereGeo, shoeMat, 0.19, -0.68, 0.09, 0.19, 0.11, 0.31);

    const drapeMesh = createMesh(
      humanGroup,
      new THREE.ConeGeometry(0.43, 0.95, 4, 1, true),
      mat(0xd8a4bd),
      0.19,
      0.67,
      0.08,
      0.8,
      1,
      0.38
    );
    drapeMesh.rotation.z = -0.26;
    drapeMesh.visible = true;
    drapeMeshRef.current = drapeMesh;

    const scarfMesh = createMesh(
      humanGroup,
      new THREE.CylinderGeometry(0.44, 0.56, 0.82, 32, 1, true),
      mat(0x237d83),
      0,
      0.34,
      0,
      1,
      0.7,
      0.6
    );
    scarfMesh.visible = false;
    scarfMeshRef.current = scarfMesh;

    // ================= Organ Anatomy Group =================
    // Brain (মস্তিষ্ক)
    createMesh(organGroup, sphereGeo, mat(0xe898a8, 0.4), 0, 1.76, 0, 0.28, 0.32, 0.26);
    // Trachea & Lungs (শ্বাসনালী ও ফুসফুস)
    createMesh(organGroup, cylGeo, mat(0x9fc5e8), 0, 1.15, 0.05, 0.04, 0.4, 0.04);
    createMesh(organGroup, sphereGeo, mat(0xd5a6bd, 0.5), -0.16, 0.95, 0, 0.14, 0.26, 0.12);
    createMesh(organGroup, sphereGeo, mat(0xd5a6bd, 0.5), 0.16, 0.95, 0, 0.14, 0.26, 0.12);
    // Heart (হৃৎপিণ্ড) pulsating mesh
    const heartMesh = createMesh(organGroup, sphereGeo, mat(0xcc0000, 0.3, 0.2), -0.04, 0.88, 0.12, 0.09, 0.11, 0.09);
    // Stomach & Digestive tract (পাকস্থলী ও অন্ত্র)
    createMesh(organGroup, sphereGeo, mat(0xb6d7a8, 0.5), 0.06, 0.52, 0.08, 0.13, 0.16, 0.12);
    createMesh(organGroup, cylGeo, mat(0xffd966, 0.6), 0, 0.22, 0.04, 0.18, 0.28, 0.14);

    // ================= Skeleton Group =================
    const boneMat = mat(0xeae6df, 0.4, 0.1);
    // Skull (করোটি)
    createMesh(skeletonGroup, sphereGeo, boneMat, 0, 1.78, 0, 0.27, 0.33, 0.26);
    // Spine (মেরুদণ্ড)
    createMesh(skeletonGroup, cylGeo, boneMat, 0, 0.8, -0.04, 0.05, 1.1, 0.05);
    // Ribcage (বক্ষপিঞ্জর)
    for (let r = 0; r < 5; r++) {
      const ring = createMesh(
        skeletonGroup,
        new THREE.TorusGeometry(0.24 - r * 0.02, 0.02, 8, 24),
        boneMat,
        0,
        1.1 - r * 0.12,
        0
      );
      ring.rotation.x = Math.PI / 2;
    }
    // Pelvis (শ্রোণীচক্র)
    createMesh(skeletonGroup, cylGeo, boneMat, 0, 0.25, 0, 0.32, 0.18, 0.2);
    // Leg bones (ঊর্বস্থি / ফিমার)
    createMesh(skeletonGroup, cylGeo, boneMat, -0.18, -0.25, 0, 0.05, 0.75, 0.05);
    createMesh(skeletonGroup, cylGeo, boneMat, 0.18, -0.25, 0, 0.05, 0.75, 0.05);

    // Platform floor
    const floorGeo = new THREE.CircleGeometry(2.4, 48);
    const floorMat = mat(0x192747);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.82;
    floor.receiveShadow = true;
    scene.add(floor);

    const ringGeo = new THREE.RingGeometry(2.2, 2.38, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x61e7f5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.81;
    scene.add(ring);

    // Pointer Drag Interaction
    let dragging = false;
    let lastX = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragging && root) {
        root.rotation.y += (e.clientX - lastX) * 0.009;
        lastX = e.clientX;
      }
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerUp);

    // Animation loop
    let reqId: number;
    let t = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      t += 0.018;
      if (!dragging && isRotating && root) {
        root.rotation.y = Math.sin(t * 0.35) * 0.12;
      }
      if (root) {
        root.position.y = Math.sin(t) * 0.025;
      }
      // Pulsate heart in organ view
      if (heartMesh && organGroup.visible) {
        const beat = 1 + Math.sin(t * 5) * 0.08;
        heartMesh.scale.set(0.09 * beat, 0.11 * beat, 0.09 * beat);
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth || 320;
      const nh = typeof height === 'number' ? height : container.clientHeight || 360;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
    };
  }, [height, isRotating]);

  // Handle outfit changes
  const applyOutfit = (kind: OutfitType) => {
    setCurrentOutfit(kind);
    onOutfitChange?.(kind);

    const palette: Record<OutfitType, number> = {
      sari: 0x9b3d83,
      threepiece: 0x237d83,
      casual: 0x4a6ac7,
      professional: 0x37445b,
      doctor: 0xf5f7fa // White doctor apron / scrubs
    };

    const c = palette[kind] || palette.sari;

    if (bodyMeshRef.current) {
      (bodyMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(c);
    }
    if (waistMeshRef.current) {
      (waistMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(
        kind === 'doctor' ? 0x008080 : c // teal inner scrub for doctor
      );
    }
    if (scarfMeshRef.current) {
      (scarfMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(
        kind === 'doctor' ? 0x20b2aa : c
      );
      scarfMeshRef.current.visible = kind === 'threepiece' || kind === 'doctor';
    }
    if (drapeMeshRef.current) {
      (drapeMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(
        kind === 'sari' ? 0xd8a4bd : c
      );
      drapeMeshRef.current.visible = kind === 'sari';
    }
    if (legLRef.current && legRRef.current) {
      const legColor =
        kind === 'casual' ? 0x354b8b : kind === 'doctor' ? 0x008080 : 0x313c64;
      (legLRef.current.material as THREE.MeshStandardMaterial).color.setHex(legColor);
      (legRRef.current.material as THREE.MeshStandardMaterial).color.setHex(legColor);
    }
  };

  // Switch between Human Avatar, Internal Organs, and Skeleton
  const setDisplayMode = (mode: AvatarMode) => {
    setViewMode(mode);
    if (humanGroupRef.current) humanGroupRef.current.visible = mode === 'human';
    if (organGroupRef.current) organGroupRef.current.visible = mode === 'organs';
    if (skeletonGroupRef.current) skeletonGroupRef.current.visible = mode === 'skeleton';
  };

  const handleZoom = (inward: boolean) => {
    if (cameraRef.current) {
      const step = inward ? -0.5 : 0.5;
      cameraRef.current.position.z = Math.min(Math.max(cameraRef.current.position.z + step, 3.5), 10);
    }
  };

  const resetRotation = () => {
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = 0;
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#29265d]/90 via-[#151d33] to-[#123b55]/90 border border-cyan-500/25 shadow-2xl ${className}`}
    >
      {/* Top Banner */}
      <div className="absolute top-3 left-4 z-10">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#61e7f5]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>DR. MUNNA 3D ASSISTANT</span>
        </div>
        <p className="text-[11px] text-gray-300">
          {viewMode === 'human'
            ? 'ইন্টারঅ্যাক্টিভ ভার্চুয়াল রূপ · পোশাক ও ভিউ নির্বাচন করুন'
            : viewMode === 'organs'
            ? 'অভ্যন্তরীণ অঙ্গসংস্থান ও সংবহনতন্ত্র (Heart, Lungs, Brain)'
            : 'কঙ্কালতন্ত্র ও দেহকাঠামো (Skeletal System)'}
        </p>
      </div>

      {/* Floating control buttons */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#0b1020]/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title="স্বয়ংক্রিয় ঘূর্ণন"
          className={`p-1.5 rounded-full transition text-xs ${
            isRotating ? 'text-cyan-300 bg-cyan-900/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
        </button>
        <button
          onClick={() => handleZoom(true)}
          title="কাছে আনুন (Zoom In)"
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(false)}
          title="দূরে নিন (Zoom Out)"
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetRotation}
          title="রিসেট"
          className="px-2.5 py-1 text-[10px] rounded-full text-gray-300 hover:text-white hover:bg-white/10 font-medium"
        >
          রিসেট
        </button>
      </div>

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Bottom Controls Bar: View Mode + Waterdrop Round Buttons */}
      <div className="p-3 bg-[#0f172a]/90 backdrop-blur-md border-t border-white/10 space-y-2.5">
        {/* Anatomy vs Avatar Mode Selection */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">ভিউ মোড:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'human', label: 'ভার্চুয়াল রূপ' },
                { id: 'organs', label: 'অঙ্গসংস্থান' },
                { id: 'skeleton', label: 'কঙ্কালতন্ত্র' }
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setDisplayMode(m.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition border ${
                  viewMode === m.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-cyan-400 shadow-sm'
                    : 'bg-[#1c2744] text-gray-300 border-gray-700 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Outfit Selection with Waterdrop & Round Style */}
        {viewMode === 'human' && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-gray-300 font-medium">পোশাক পরিবর্তন:</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'sari', label: 'শাড়ি' },
                  { id: 'threepiece', label: 'থ্রি-পিস' },
                  { id: 'casual', label: 'ক্যাজুয়াল' },
                  { id: 'professional', label: 'প্রফেশনাল' },
                  { id: 'doctor', label: 'ডক্টরস অ্যাপ্রন' }
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => applyOutfit(item.id)}
                  className={`px-3.5 py-1.5 text-xs transition-all duration-200 font-medium border rounded-[20px] ${
                    currentOutfit === item.id
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white border-cyan-300 shadow-md shadow-cyan-500/20 scale-105 rounded-br-sm'
                      : 'bg-[#1c2744] text-gray-300 border-gray-700/60 hover:border-cyan-400 hover:text-white rounded-br-sm'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
