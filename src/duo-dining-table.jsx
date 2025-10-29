import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/duo-dining-table.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.wood.geometry}
        material={materials.wood}
        position={[0, 0.090, 0]}
        userData={{ name: 'wood' }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.metal.geometry}
        material={materials.metal}
        position={[0, 0.090, 0]}
        userData={{ name: 'metal' }}
      />
    </group>
  )
}

useGLTF.preload('/duo-dining-table.glb')  
