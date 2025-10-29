// src/Studydesk.jsx
import React from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function Model({ currentTexture }) {
  const { nodes, materials } = useGLTF('/Studydesk.glb')

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

  // Function to render all available meshes
  const renderMeshes = () => {
    const meshes = []
    
    // Try to find and render all mesh nodes
    Object.keys(nodes).forEach(nodeName => {
      const node = nodes[nodeName]
      if (node.geometry) {
        // Find the appropriate material
        let material = materials[nodeName]
        if (!material) {
          // Try to find a material with similar name
          const materialKeys = Object.keys(materials)
          const matchingMaterial = materialKeys.find(key => 
            key.toLowerCase().includes(nodeName.toLowerCase()) ||
            nodeName.toLowerCase().includes(key.toLowerCase())
          )
          material = matchingMaterial ? materials[matchingMaterial] : materials[materialKeys[0]]
        }
        
        meshes.push(
          <mesh
            key={nodeName}
            castShadow
            receiveShadow
            geometry={node.geometry}
            material={material}
            position={[0, -0.60, 0]}
          />
        )
      }
    })
    
    return meshes
  }

  return (
    <group dispose={null}>
      {renderMeshes()}
    </group>
  )
}

useGLTF.preload('/Studydesk.glb')
