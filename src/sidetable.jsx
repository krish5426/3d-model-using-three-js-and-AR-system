import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/sidetable.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.metal.geometry}
        material={materials.metal}
        position={[0,-0.010, 0]}
        userData={{ name: 'metal' }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.wood.geometry}
        material={materials.wood}
        position={[0,-0.010, 0]}
        userData={{ name: 'wood' }}
      />
    </group>
  )
}

useGLTF.preload('/sidetable.glb')
