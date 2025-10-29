import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/headboard.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.wood.geometry}
        material={materials.wood}
        position={[0,0.020 ,0]}
        userData={{ name: 'wood' }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.metal.geometry}
        material={materials.metal}
        position={[0,0.020,0]}
        userData={{ name: 'metal' }}
      />
    </group>
  )
}

useGLTF.preload('/headboard.glb')
