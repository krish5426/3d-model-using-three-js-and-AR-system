// src/components/UniversalModel.jsx
import React from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function UniversalModel({ modelPath, currentTexture }) {
  const { nodes, materials, scene } = useGLTF(modelPath)

  // Load textures
  const texture1 = useTexture('/Texture/1.jpg')
  const texture2 = useTexture('/Texture/2.jpg')
  const texture3 = useTexture('/Texture/3.jpg')
  const texture4 = useTexture('/Texture/4.jpg')
  const texture5 = useTexture('/Texture/5.jpg')

  const textures = { 
    texture_1: texture1, 
    texture_2: texture2, 
    texture_3: texture3, 
    texture_4: texture4, 
    texture_5: texture5 
  }
  
  const selectedTex = textures[currentTexture]

  // Configure texture
  if (selectedTex) {
    if (selectedTex.encoding !== undefined) {
      selectedTex.encoding = THREE.sRGBEncoding
    } else {
      selectedTex.colorSpace = THREE.SRGBColorSpace
    }
    selectedTex.flipY = false
    selectedTex.needsUpdate = true
  }

  // Apply texture to all materials that contain 'wood' in their name
  if (selectedTex) {
    Object.values(materials).forEach((mat) => {
      if (mat.name.toLowerCase().includes('wood')) {
        mat.map = selectedTex
        mat.needsUpdate = true
      }
    })
  }

  // Function to recursively apply shadows to all meshes
  const applyShadows = (object) => {
    if (object.isMesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
    if (object.children) {
      object.children.forEach(applyShadows)
    }
  }

  // Apply shadows to the entire scene
  React.useEffect(() => {
    if (scene) {
      applyShadows(scene)
    }
  }, [scene])

  // If we have a scene, use it directly (most reliable method)
  if (scene) {
    return <primitive object={scene} dispose={null} />
  }

  // Fallback: try to render specific nodes if they exist
  const renderNodes = () => {
    const meshes = []
    
    // Try different possible node names
    const possibleNodes = ['metal', 'wood', 'Mesh', 'mesh', 'Object', 'object']
    
    possibleNodes.forEach(nodeName => {
      if (nodes[nodeName]) {
        meshes.push(
          <mesh
            key={nodeName}
            castShadow
            receiveShadow
            geometry={nodes[nodeName].geometry}
            material={materials[nodeName] || materials[Object.keys(materials)[0]]}
            position={[0, 0, 0]}
          />
        )
      }
    })

    // If no specific nodes found, render all available nodes
    if (meshes.length === 0) {
      Object.keys(nodes).forEach(nodeName => {
        const node = nodes[nodeName]
        if (node.geometry) {
          meshes.push(
            <mesh
              key={nodeName}
              castShadow
              receiveShadow
              geometry={node.geometry}
              material={materials[nodeName] || materials[Object.keys(materials)[0]]}
              position={[0, 0.0, 0]}
            />
          )
        }
      })
    }

    return meshes
  }

  return (
    <group dispose={null}>
      {renderNodes()}
    </group>
  )
}

// Preload function
export const preloadModel = (modelPath) => {
  useGLTF.preload(modelPath)
}
