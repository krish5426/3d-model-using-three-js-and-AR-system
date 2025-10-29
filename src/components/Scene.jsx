import React, { useState, Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './Scene'
import LoadingSpinner from './LoadingSpinner'
import ModelInfo from './ModelInfo'
import TextureControls from './TextureControls'
import './ModelViewer.css'
//import { ARButton } from 'three/examples/jsm/webxr/ARButton'
import * as THREE from 'three'
import { ARButton } from 'webxr'

function ModelViewer() {
  const [currentTexture, setCurrentTexture] = useState('texture_1')
  const [isLoading, setIsLoading] = useState(true)

  const canvasRef = useRef()

  const handleTextureChange = (textureName) => {
    setCurrentTexture(textureName)
  }

  const handleModelLoad = () => {
    setIsLoading(false)
  }

  useEffect(() => {
    if (canvasRef.current) {
      const renderer = canvasRef.current.gl
      renderer.xr.enabled = true

      // remove agar old ARButton already added hai
      const oldBtn = document.querySelector('.ar-button')
      if (oldBtn) oldBtn.remove()

      // naya WebXR AR button create
      const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] })
      arButton.classList.add('ar-button')
      document.body.appendChild(arButton)
    }
  }, [])

  return (
    <div className="model-viewer-container">
      <div className="main-viewer">
        <div className="viewer-container">
          <Canvas
            ref={canvasRef}
            camera={{ position: [4, 3, 5], fov: 75 }}
            style={{ width: '100%', height: '100%' }}
            onCreated={({ gl }) => {
              gl.setSize(window.innerWidth, window.innerHeight)
              gl.setPixelRatio(window.devicePixelRatio)
              gl.outputEncoding = THREE.sRGBEncoding
              gl.xr.enabled = true
            }}
          >
            <Suspense fallback={null}>
              <Scene 
                currentTexture={currentTexture} 
                onModelLoad={handleModelLoad}
              />
              <OrbitControls
                enableDamping={true}
                dampingFactor={0.05}
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={15}
                autoRotate={false}
              />
            </Suspense>
          </Canvas>
        </div>

        {isLoading && <LoadingSpinner />}

        <ModelInfo />

        <TextureControls 
          currentTexture={currentTexture}
          onTextureChange={handleTextureChange}
        />
      </div>
    </div>
  )
}

export default ModelViewer
