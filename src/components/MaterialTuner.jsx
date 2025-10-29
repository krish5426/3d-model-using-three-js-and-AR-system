// src/components/MaterialTuner.jsx
// Utilities and components to normalize materials across all models.
// - MaterialTuner: for a specific scene ref (kept for compatibility)
// - GlobalMaterialTuner: applies rules to the entire R3F scene via useThree
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function MaterialTuner({ sceneRef, selectedTexture, forceMetalBlack = true, extraBlackNameIncludes = [] }) {
  // Internal rule: if a material name includes 'wood' -> assign selectedTexture as map
  // if includes 'metal' or 'black' and forceMetalBlack -> set color to black
  useEffect(() => {
    const scene = sceneRef?.current
    if (!scene) return

    const blackMatchers = ['metal', 'black', ...extraBlackNameIncludes.map((s) => s.toLowerCase())]

    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material
        const name = (mat.name || '').toLowerCase()
        // Ensure undersides are visible when rotating below the model
        if (mat.side !== THREE.DoubleSide) {
          mat.side = THREE.DoubleSide
          mat.shadowSide = THREE.DoubleSide
          mat.needsUpdate = true
        }
        if (selectedTexture && name.includes('wood')) {
          mat.map = selectedTexture
          mat.needsUpdate = true
        }
        if (forceMetalBlack && blackMatchers.some((kw) => name.includes(kw))) {
          if (mat.color) {
            mat.color.set('#000000')
          }
        }
      }
    })
  }, [sceneRef, selectedTexture, forceMetalBlack])

  return null
}

// Apply rules to the whole scene (recommended):
export function GlobalMaterialTuner({ selectedTexture, forceMetalBlack = true, extraBlackNameIncludes = [], accentColor, accentNameIncludes = [], isTvPanel = false }) {
  const { scene } = useThree()

  useEffect(() => {
    if (!scene) return
    const blackMatchers = ['metal', 'black', ...extraBlackNameIncludes.map((s) => s.toLowerCase())]
    const accentMatchers = (accentNameIncludes || []).map((s) => s.toLowerCase())
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material
        const name = (mat.name || '').toLowerCase()
        // Ensure undersides are visible when rotating below the model
        if (mat.side !== THREE.DoubleSide) {
          mat.side = THREE.DoubleSide
          mat.shadowSide = THREE.DoubleSide
          mat.needsUpdate = true
        }
        if (selectedTexture && name.includes('wood')) {
          mat.map = selectedTexture
          mat.needsUpdate = true
        }
        // Accent color takes priority if provided and name matches
        if (accentColor && accentMatchers.some((kw) => name.includes(kw))) {
          if (mat.color) mat.color.set(accentColor)
        } else if (forceMetalBlack && blackMatchers.some((kw) => name.includes(kw))) {
          if (mat.color) mat.color.set('#000000')
        } else if (isTvPanel && accentColor) {
          // Broad fallback for TV panel: if this is not wood and has no texture map, tint with accent
          const isWoodLike = name.includes('wood')
          const hasMap = !!mat.map
          if (!isWoodLike && !hasMap && mat.color) {
            mat.color.set(accentColor)
          }
        }
      }
    })
  }, [scene, selectedTexture, forceMetalBlack, extraBlackNameIncludes, accentColor, accentNameIncludes, isTvPanel])

  return null
}


