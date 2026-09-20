/**
 * Simple Three.js viewer (via React Three Fiber).
 *
 * Wrapped in React.memo so it only re-renders when modelUrl / color /
 * scale / camera change. The loading overlay lives in App, so flipping
 * `isModelLoading` does not rebuild the WebGL canvas.
 */
import { memo, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

function cloneMaterials(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => material.clone());
    } else if (child.material) {
      child.material = child.material.clone();
    }
  });
}

function isPreservedDetail(mesh, material) {
  const label = `${mesh.name} ${material?.name || ''}`.toLowerCase();
  return /eye|pupil|beak|bill|lash|brow|mouth|tongue/.test(label);
}

/**
 * tint — multiply color over textures (Boom Box, Helmet).
 * solid — paint textured body parts only (multi-mesh models).
 * For single-texture models like the Khronos Duck, use tint so baked eyes stay black.
 */
function applyColor(root, color, colorMode) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material || isPreservedDetail(child, material)) return;

      if (colorMode === 'solid') {
        if (!material.map) return;
        material.map = null;
      }

      if (material.color) {
        material.color.set(color);
      }
      material.needsUpdate = true;
    });
  });
}

function Model({ color, colorMode, scale, url, onLoadingChange }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const copy = scene.clone(true);
    cloneMaterials(copy);
    return copy;
  }, [scene]);
  const measureRef = useRef();
  const [fit, setFit] = useState(null);

  useLayoutEffect(() => {
    applyColor(cloned, color, colorMode);
  }, [cloned, color, colorMode]);

  // Measure after the model is in the scene. Detached clones often report an
  // empty bounding box, which would make the object look huge and off-center.
  useLayoutEffect(() => {
    if (fit || !measureRef.current) return;
    const box = new Box3().setFromObject(measureRef.current);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    setFit({
      offset: [-center.x, -center.y, -center.z],
      fitScale: 2 / maxDim,
    });
  }, [cloned, fit]);

  useEffect(() => {
    if (fit) onLoadingChange(false);
  }, [fit, onLoadingChange]);

  if (!fit) {
    return (
      <group ref={measureRef} visible={false}>
        <primitive object={cloned} />
      </group>
    );
  }

  return (
    <group scale={scale * fit.fitScale}>
      <group position={fit.offset}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

function ProductViewer({ modelUrl, color, colorMode = 'tint', scale, camera, onLoadingChange }) {
  return (
    <div className="canvas-wrap">
      <Canvas className="canvas">
        <PerspectiveCamera
          makeDefault
          fov={camera.fov}
          position={camera.position}
        />
        <color attach="background" args={['#14161c']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.3} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        {/* The overlay lives in App; the reducer already marks loading on select. */}
        <Suspense fallback={null}>
          <Model
            key={modelUrl}
            url={modelUrl}
            color={color}
            colorMode={colorMode}
            scale={scale}
            onLoadingChange={onLoadingChange}
          />
        </Suspense>
        {/* Remount controls with the product so the previous orbit/zoom is not kept. */}
        <OrbitControls key={`${modelUrl}-controls`} makeDefault enableDamping target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}

export default memo(ProductViewer);
