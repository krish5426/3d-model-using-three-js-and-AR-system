import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// OLD behavior requested: only the wood material changes via texture buttons.
// The side/border color stays fixed as authored in the GLB.
// TV panel: wood changes with texture; border color (material "color") changes via accentColor prop
export function Model({ accentColor, ...props }) {
  const { nodes, materials } = useGLTF('/t.vpanel.glb')
  if (materials.color && accentColor) {
    if (materials.color.color) materials.color.color = new THREE.Color(accentColor)
    materials.color.needsUpdate = true
  }
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.wood.geometry}
        material={materials.wood}
        position={[0,-0.04, 0]}
        userData={{ name: 'wood' }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.color.geometry}
        material={materials.color}
        position={[0,-0.04, 0]}
        userData={{ name: 'color' }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.black.geometry}
        material={materials.black}
        position={[0,-0.04, 0]}
        userData={{ name: 'black' }}
      />
    </group>
  )
}

useGLTF.preload('/t.vpanel.glb')
