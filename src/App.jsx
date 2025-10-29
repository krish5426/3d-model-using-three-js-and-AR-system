// src/App.jsx
import React, { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls,ContactShadows, Bounds } from '@react-three/drei'
import './App.css'
// Dynamic import map for all model components exporting `Model`
// This allows you to drop many JSX files and reference them via config
const MODEL_COMPONENTS = import.meta.glob('./*.jsx', { eager: true })
// Helper: given component path, return the React component
const getModelComponent = (componentPath) => {
  const mod = MODEL_COMPONENTS[componentPath]
  return mod?.Model || null
}
import { ModelSelector } from './components/ModelSelector'
import { MODELS } from './modelsConfig'
import { UniversalModel } from './components/UniversalModel'
import { GlobalMaterialTuner } from './components/MaterialTuner'
import * as THREE from 'three'
import { EffectComposer, SSAO } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'


export default function App() {
  const [currentTexture, setCurrentTexture] = useState('texture_1')
  const [currentModel, setCurrentModel] = useState('bedside') // Default model id from config
  const [brandColor, setBrandColor] = useState('#1e3a8a')
  const [textureAccentColor, setTextureAccentColor] = useState('#1e3a8a')
  const [panelOpen, setPanelOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth <= 768) setPanelOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  // Map model ids to public AR asset paths
  const AR_PATHS = {
    'bedside': { glb: '/BedsidePanel.glb', usdz: null },
    'studydesk': { glb: '/Studydesk.glb', usdz: null },
    'clothrack': { glb: '/Clothrack.glb', usdz: null },
    'duo-dining-table': { glb: '/duo-dining-table.glb', usdz: null },
    'headboard': { glb: '/headboard.glb', usdz: null },
    'joint-unit': { glb: '/JointUnit.glb', usdz: null },
    'luggage-bench': { glb: '/luggagebench.glb', usdz: null },
    'microfridge': { glb: '/microfridge.glb', usdz: null },
    'side-table': { glb: '/sidetable.glb', usdz: null },
    'tv-panel': { glb: '/t.vpanel.glb', usdz: null },
    'media-unit': { glb: '/mediaunit.glb', usdz: null },
  }

  const isAndroid = () => /Android/i.test(navigator.userAgent)
  const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const openAR = () => {
    const entry = MODELS.find((m) => m.id === currentModel)
    const title = entry?.name || 'Model'
    const ar = AR_PATHS[currentModel]
    if (!ar || !ar.glb) return
    if (isAndroid()) {
      const file = new URL(ar.glb, window.location.origin).toString()
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(file)}&mode=ar_preferred&title=${encodeURIComponent(title)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(file)};end;`
      window.location.href = intentUrl
      return
    }
    if (isIOS()) {
      if (ar.usdz) {
        const file = new URL(ar.usdz, window.location.origin).toString()
        window.location.href = file
      }
      return
    }
    // Desktop: do nothing
  }
  // Texture instances (kept outside Canvas via drei loaders is fine here since used inside Canvas tree)
  // We keep references by url so they are cached by drei
  const textureMap = {
    texture_1: new THREE.TextureLoader().load('/Texture/1.jpg'),
    texture_2: new THREE.TextureLoader().load('/Texture/2.jpg'),
    texture_3: new THREE.TextureLoader().load('/Texture/3.jpg'),
    texture_4: new THREE.TextureLoader().load('/Texture/4.jpg'),
    texture_5: new THREE.TextureLoader().load('/Texture/5.jpg'),
  }
  const selectedTex = textureMap[currentTexture]
  if (selectedTex) {
    // Ensure color space and orientation correct for PBR
    if (selectedTex.encoding !== undefined) selectedTex.encoding = THREE.sRGBEncoding
    else selectedTex.colorSpace = THREE.SRGBColorSpace
    selectedTex.flipY = false
    selectedTex.needsUpdate = true
  }

  // Extract average color from an image (used for logo and texture accent)
  const extractAverageColor = (url) => new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      const w = 32, h = 32
      canvas.width = w; canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h).data
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; count++ }
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count)
      const toHex = (n) => n.toString(16).padStart(2, '0')
      resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`)
    }
    img.onerror = () => resolve('#1e3a8a')
    img.src = url
  })

  // Try to detect brand color from logo on mount
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const candidates = ['/images/logo.png','/images/logo.jpg','/images/Logo.png','/images/Logo.jpg']
      for (const src of candidates) {
        const color = await extractAverageColor(src)
        if (!cancelled && color) { setBrandColor(color); break }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  // Update TV accent color from current wood texture
  useEffect(() => {
    const idx = currentTexture.split('_')[1]
    const url = `/Texture/${idx}.jpg`
    extractAverageColor(url).then(setTextureAccentColor)
  }, [currentTexture])

  return (
    <div className="App">
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {/* Viewer area */}
        <div
          className="viewer-area"
          style={{
            flex: isMobile ? 'none' : '1 1 0',
            height: isMobile ? 'calc(100vh - 110px)' : '100vh',
            position: 'relative',
            transition: 'width 0.4s',
          }}
        >
          <Canvas
            camera={{
              position: isMobile ? [0, 1.3, 4.5] : [4, 3, 5], // lower Y for mobile to raise model
              fov: isMobile ? 32 : 25
            }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[2, 10, 0]} intensity={3} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
            <Suspense fallback={null}>
              {/* Material normalization */}
              <GlobalMaterialTuner 
                selectedTexture={selectedTex} 
                forceMetalBlack={true} 
                extraBlackNameIncludes={currentModel === 'tv-panel' ? ['frame','back','panel'] : []}
                accentColor={undefined}
                accentNameIncludes={[]}
                isTvPanel={false}
              />
              {/* Model rendering */}
              {(() => {
                const entry = MODELS.find((m) => m.id === currentModel)
                if (!entry) return null
                const ModelComponent = entry.componentPath ? getModelComponent(entry.componentPath) : null
                const needsDownOffset = entry.id === 'joint-unit' || entry.id === 'luggage-bench'
                const offsetY = needsDownOffset ? -0.25 : 0
                const needsSmall = entry.id === 'joint-unit' || entry.id === 'luggage-bench'
                const scaleFactor = needsSmall ? 0.85 : 1
                const fitMargin = needsSmall ? 1.8 : 1.5
                if (ModelComponent) {
                  const accentByTexture = {
                    texture_1: '#1e3a8a',
                    texture_2: '#d2c158',
                    texture_3: '#0b7a7a',
                    texture_4: '#ff8a33',
                    texture_5: '#6b3a2e',
                  }
                  const accentColor = entry.id === 'tv-panel' ? (accentByTexture[currentTexture] || '#1e3a8a') : undefined
                  return (
                    <group key={`model-${currentModel}`}>
                      <Bounds key={currentModel} fit clip margin={fitMargin} observe={false}>
                        <group position={[0, offsetY, 0]} scale={[scaleFactor, scaleFactor, scaleFactor]}>
                          <ModelComponent currentTexture={currentTexture} accentColor={accentColor} />
                        </group>
                      </Bounds>
                    </group>
                  )
                }
                if (entry.modelPath) {
                  return (
                    <group key={`model-${currentModel}`}>
                      <Bounds key={currentModel} fit clip margin={fitMargin} observe={false}>
                        <group position={[0, offsetY, 0]} scale={[scaleFactor, scaleFactor, scaleFactor]}>
                          <UniversalModel modelPath={entry.modelPath} currentTexture={currentTexture} />
                        </group>
                      </Bounds>
                    </group>
                  )
                }
                return null
              })()}
              {/* Controls */}
              {(() => {
                const isLargeModel = currentModel === 'joint-unit' || currentModel === 'luggage-bench'
                const maxDistance = isLargeModel ? 14 : 8
                const minDistance = isLargeModel ? 3 : 1
                return (
                  <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    enableZoom={true}
                    maxPolarAngle={Math.PI / 2}
                    maxDistance={maxDistance}
                    minDistance={minDistance}
                    target={isMobile ? [0, -0.15, 0] : [0, -0.15, 0]} // raise target Y for mobile
                  />
                )
              })()}
              <ContactShadows
                key={currentModel}
                position={[0, -0.60, 0]}
                opacity={0.92}
                scale={4}
                blur={0.8}
                far={0.9}
                resolution={1024}
                color="#000000"
                frames={1}
                smooth
              />
            </Suspense>
            <EffectComposer>
              <SSAO
                blendFunction={BlendFunction.MULTIPLY}
                samples={30}
                radius={0.14}
                intensity={100}
                luminanceInfluence={1}
                bias={0.03}
                distanceThreshold={0.99}
                distanceFalloff={0.002}
                rangeThreshold={0.20}
                rangeFalloff={0.001}
              />
            </EffectComposer>
          </Canvas>
          {/* Desktop: Texture and AR/Add to cart buttons */}
          {!isMobile && (
            <>
              <div style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      onClick={() => setCurrentTexture(`texture_${n}`)}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        backgroundImage: `url(/images/${n}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        //border: currentTexture === `texture_${n}` ? '3px solid orange' : '2px solid #ddd',
                        boxShadow: 'none',
                        transition: 'all 0.2s',
                      }}
                      aria-label={`Select material ${n}`}
                    />
                  ))}
                </div>
              </div>
              {/* //<button
                type="button"
                onClick={openAR}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '12px 18px',
                  backgroundColor: currentModel ? '#ed8739' : '#ed8739',
                  //color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  zIndex: 10,
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
              >
                View in AR
              </button> */}
              <button
                type="button"
                style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 24,
                  padding: '12px 18px',
                  backgroundColor: currentModel ? '#4d2821' : '#4d2821',
                  //color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  zIndex: 10,
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
                onClick={() => console.log('Add to cart')}
              >
                Add to cart
              </button>
            </>
          )}
        </div>
        {/* Mobile: bottom bar */}
        {isMobile && (
          <div
            style={{
                width: '100vw',
                position: 'fixed',
                left: 0,
                bottom: 0,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                /* keep overall background transparent so the page stays visually uniform */
                background: 'transparent',
                /* add a little extra bottom padding so buttons don't touch the edge */
                paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 8px))',
                gap: 6,
              }}
          >
            {/* Material swatches: slightly lifted */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 6, transform: 'translateY(-6px)' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  onClick={() => setCurrentTexture(`texture_${n}`)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    backgroundImage: `url(/images/${n}.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'all 0.2s',
                  }}
                  aria-label={`Select material ${n}`}
                />
              ))}
            </div>

            {/* Action buttons: keep original size and styling but lift them slightly so they don't touch the edge */}
            <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center', transform: 'translateY(-6px)', padding: '6px 12px 0 12px' }}>
              <button
                type="button"
                onClick={openAR}
                style={{
                  flex: 1,
                  maxWidth: 160,
                  padding: '14px 0',
                  backgroundColor: currentModel ? '#4d2821' : '#4d2821',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
              >
                View in AR
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  maxWidth:160,
                  padding: '14px 0',
                  backgroundColor: currentModel ? '#ed8739' : 'orange',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
                onClick={() => console.log('Add to cart')}
              >
                Add to cart
              </button>
            </div>
          </div>
        )}
        {/* Model Selector Panel */}
        <div
          style={{
            width: isMobile ? 250 : 300,
            height: '100vh',
            //background: 'rgba(255,255,255,0.95)',
            position: 'fixed',
            top: 1,
            right: 0,
            boxShadow: '-2px 0 12px rgba(0,0,0,0.07)',
            zIndex: 1000,
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            //borderLeft: '1px solid #eee',
            overflowY: 'auto',
            transform: panelOpen ? 'translateX(0)' : `translateX(${isMobile ? 250 : 300}px)`,
            opacity: panelOpen ? 1 : 0.2,
            pointerEvents: panelOpen ? 'auto' : 'none',
          }}
        >
          <ModelSelector 
            currentModel={currentModel} 
            onModelChange={setCurrentModel} 
            brandColor={brandColor}
          />
        </div>
        {/* Toggle button */}
        <button
          style={{
            position: 'fixed',
            top: 32,
            right: panelOpen ? (isMobile ? 250 : 300) : 0,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #ccc',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            fontSize: '1.7rem',
            zIndex: 2001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1)',
            padding: 0,
            overflow: 'hidden',
          }}
          onClick={() => setPanelOpen(!panelOpen)}
          aria-label={panelOpen ? "Hide model selector panel" : "Show model selector panel"}
        >
          {panelOpen ? 
          (
            <><span style={{ fontSize: '2rem', fontWeight: 1000, color: '#1e3a8a', lineHeight: 1 }}></span><img
              src="/images/err1.png"
              onError={(e) => { e.currentTarget.src = e.currentTarget.src.includes('dot.jpg') ? '/images/dot.jpg' : '/images/dot.jpg' } }
              alt="Logo"
              style={{ height: 40, width: 40, objectFit: 'contain', marginLeft: 0 }} /></>
          ) : (
                   <>     
              <span style={{fontSize: '2rem', fontWeight: 1000, color: '#1e3a8a', marginRight: 2}}></span>
              <img
                src="/images/err2.png"
                onError={(e) => { e.currentTarget.src = e.currentTarget.src.includes('dot.jpg') ? '/images/dot.jpg' : '/images/dot.jpg' }}
                alt="Logo"
                style={{ height: 40, width: 40, objectFit: 'contain', marginLeft: 0 }}
              />
            </>
          )}
        </button>
        {/* Logo */}
        <img
          src="/images/Logo.png"
          onError={(e) => { e.currentTarget.src = e.currentTarget.src.includes('Logo.png') ? '/images/logo.png' : '/images/logo.jpg' }}
          alt="Logo"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            height: isMobile ? 32 : 40,
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 3000
          }}
        />
      </div>
    </div>
  );
}
