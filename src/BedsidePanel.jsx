// src/BedsidePanel.jsx
import React from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function Model({ currentTexture }) {
  const { nodes, materials } = useGLTF('/BedsidePanel.glb')

  // Load textures yahan (Canvas ke andar safe hai)
  const texture1 = useTexture('/Texture/1.jpg') 
  const texture2 = useTexture('/Texture/2.jpg')
  const texture3 = useTexture('/Texture/3.jpg')
  const texture4 = useTexture('/Texture/4.jpg')
  const texture5 = useTexture('/Texture/5.jpg')

  const textures = { texture_1: texture1, texture_2: texture2, texture_3: texture3, texture_4: texture4, texture_5: texture5 }
  const selectedTex = textures[currentTexture]

  if (selectedTex) {
    if (selectedTex.encoding !== undefined) {
      selectedTex.encoding = THREE.sRGBEncoding
    } else {
      selectedTex.colorSpace = THREE.SRGBColorSpace
    }
    selectedTex.flipY = false
    selectedTex.needsUpdate = true
  }

  if (selectedTex) {
    Object.values(materials).forEach((mat) => {
      if (mat.name.toLowerCase().includes('wood')) {
        mat.map = selectedTex
        mat.needsUpdate = true
      }
    })
  }

  return (
    <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.metal.geometry}
        material={materials.metal}
        //position={[0.096, 0.634, -0.241]}
        position={[0,-0.04,0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.wood.geometry}
        material={materials.wood}
        position={[0,-0.04,0]}
      />
    </group>
  )
}

useGLTF.preload('/BedsidePanel.glb')
