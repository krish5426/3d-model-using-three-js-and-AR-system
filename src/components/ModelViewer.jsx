import React, { useState, Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './Scene'
import LoadingSpinner from './LoadingSpinner'
import ModelInfo from './ModelInfo'
import TextureControls from './TextureControls'
import './ModelViewer.css'
import { ARButton } from 'three/examples/jsm/webxr/ARButton'
import * as THREE from 'three'


function ModelViewer() {
  const [currentTexture, setCurrentTexture] = useState('texture_1')
  const [isLoading, setIsLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
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
      if (!document.querySelector('.ar-button')) {
        const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] })
        arButton.classList.add('ar-button')
        document.body.appendChild(arButton)
      }
    }
  }, [])

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth <= 768) setPanelOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="model-viewer-container" style={{display: 'flex', flexDirection: 'row', height: '100vh'}}>
      <div className="main-viewer" style={{flex: 1, position: 'relative'}}>
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
      </div>
      {/* Right Panel (desktop: toggleable, mobile: always visible) */}
      {(panelOpen || isMobile) && (
        <div 
          className="right-panel"
          style={{
            width: isMobile ? '100vw' : 320,
            maxWidth: isMobile ? '100vw' : 320,
            minWidth: isMobile ? '100vw' : 320,
            background: '#fff',
            boxShadow: isMobile ? '0 -2px 12px rgba(0,0,0,0.07)' : '-2px 0 12px rgba(0,0,0,0.07)',
            position: isMobile ? 'fixed' : 'relative',
            right: 0,
            top: isMobile ? 'auto' : 0,
            bottom: isMobile ? 0 : 'auto',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            padding: isMobile ? '24px 12px 16px 12px' : '32px 24px 24px 24px',
            gap: isMobile ? 24 : 32
          }}
        >
          {/* Hide button (desktop only) */}
          {!isMobile && (
            <button
              style={{
                position: 'absolute',
                left: -32,
                top: 24,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid #ccc',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                zIndex: 3
              }}
              onClick={() => setPanelOpen(false)}
              aria-label="Hide panel"
            >&gt;</button>
          )}
          <ModelInfo />
          <TextureControls 
            currentTexture={currentTexture}
            onTextureChange={handleTextureChange}
          />
        </div>
      )}
      {/* Show button (desktop only, when panel hidden) */}
      {!panelOpen && !isMobile && (
        <button
          style={{
            position: 'absolute',
            right: 0,
            top: 24,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #ccc',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            zIndex: 10
          }}
          onClick={() => setPanelOpen(true)}
          aria-label="Show panel"
        >&lt;</button>
      )}
    </div>
  )
}

export default ModelViewer
