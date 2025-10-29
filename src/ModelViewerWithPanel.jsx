import React, { useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import styles from "./ModelViewerWithPanel.module.css";

// Helper: Material button (color swatch)
function MaterialButton({ color, selected, onClick }) {
  return (
    <button
      className={styles.materialButton + (selected ? " " + styles.selected : "")}
      style={{ background: color }}
      onClick={onClick}
      aria-label={`Select material ${color}`}
    />
  );
}

// Helper: Action button
function ActionButton({ children, onClick }) {
  return (
    <button className={styles.actionButton} onClick={onClick}>
      {children}
    </button>
  );
}

// 3D Model loader (GLTF)
function Model({ url, materialColor }) {
  const { scene } = useGLTF(url);
  // Optionally, update material color
  React.useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.set(materialColor);
        child.material.needsUpdate = true;
      }
    });
  }, [scene, materialColor]);
  // Position model slightly higher
  return <primitive object={scene} position={[0, 0.2, 0]} />;
}

// Main component
export default function ModelViewerWithPanel({
  modelUrl = "/BedsidePanel.glb",
  materialColors = ["#bca37f", "#a4907c", "#f1efef", "#e5e5cb", "#776b5d"],
}) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [loading, setLoading] = useState(true);

  // Responsive: detect mobile
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.viewerRoot}>
      <div className={styles.canvasContainer + (panelOpen ? "" : " " + styles.fullWidth)}>
        <Canvas camera={{ position: [0, 0.3, 2.2], fov: 45 }} className={styles.canvas}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 4, 2]} intensity={0.7} />
          <Suspense fallback={<Html center>Loading...</Html>}>
            <Model url={modelUrl} materialColor={materialColors[selectedMaterial]} />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>
      {/* Side panel */}
      <div
        className={
          styles.sidePanel +
          (panelOpen ? " " + styles.panelOpen : " " + styles.panelClosed) +
          (isMobile ? " " + styles.mobile : "")
        }
        style={{ pointerEvents: 'auto' }} // Always allow interaction with the toggle button
      >
        <div className={styles.panelContent}>
          {/* Toggle button always rendered inside the panel */}
          <button
            className={styles.toggleButton}
            onClick={() => setPanelOpen((open) => !open)}
            aria-label={panelOpen ? "Close panel" : "Open panel"}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
          >
            <img src='/images/dot.jpg' alt='toggle' style={{width: 24, height: 24}} />
          </button>
          {/* Only show the rest of the content if open */}
          {panelOpen && <>
            {/* Material buttons */}
            <div className={styles.materialRow}>
              {materialColors.map((color, i) => (
                <MaterialButton
                  key={color}
                  color={color}
                  selected={i === selectedMaterial}
                  onClick={() => setSelectedMaterial(i)}
                />
              ))}
            </div>
            {/* Action buttons */}
            <div className={styles.actionRow}>
              <ActionButton onClick={() => alert("Added to cart!")}>Add to Cart</ActionButton>
              <ActionButton onClick={() => alert("View in AR coming soon!")}>View in AR</ActionButton>
            </div>
          </>}
        </div>
      </div>
      {/* Show button removed: toggle is always inside the panel now */}
    </div>
  );
}

// Preload GLTF
useGLTF.preload = (url) => {
  // no-op for now
};