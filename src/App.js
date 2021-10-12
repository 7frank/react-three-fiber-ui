import * as THREE from "three"
import React, { Suspense, useMemo, useEffect, useRef } from "react"
import { Canvas, useLoader, useThree, useFrame } from "react-three-fiber"
import { useAspect, Html } from "drei"
import { Flex, Box, useFlexInvalidate } from "./react-three-flex"
import Text from "./Text"
import data from "./data"

const state = {
  top: 0,
  pages: 2,
}

function Image({ i = 0, r = 0, url, ...rest }) {
  r = useMemo(() => r || Math.round(Math.random() * 100), [])
  const texture = useLoader(THREE.TextureLoader, url)
  const invalidate = useFlexInvalidate()
  const groupRef = useRef()
  useFrame(({ clock }) => {
    if (i > 0 && i % 10 === 0) {
      groupRef.current.scale.x = 1 + Math.sin(clock.getElapsedTime()) * 0.8
      // Inform flexbox
      invalidate()
    }
  })
  return (
    <group ref={groupRef} {...rest}>
      <mesh position={[0, 0, 10]} castShadow receiveShadow>
        <boxBufferGeometry args={[50 + r, 50, 50]} />
        <meshStandardMaterial map={texture} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Images() {
  return data.map((url, i) => (
    <Box key={url} margin={10}>
      <Image i={i} url={url} />
    </Box>
  ))
}

function Grid() {
  const group = useRef()
  const { size } = useThree()
  const [vpWidth] = useAspect("cover", size.width, size.height)
  const vec = new THREE.Vector3()
  useFrame(() => group.current.position.lerp(vec.set(0, state.top, 0), 0.1))
  return (
    <group ref={group}>
      <Flex
        mainAxis="x"
        crossAxis="y"
        flexDirection="row"
        flexWrap="wrap"
        justify="center"
        //justify="space-between"
        alignItems="center"
        size={[vpWidth, 0, 0]}>
        <Images />
        <Box margin={10}>
          <Text size={15}>REACT</Text>
        </Box>
        <Images />
        <Box margin={10}>
          <Text size={15}>THREE</Text>
        </Box>
        <Images />
        <Box margin={10}>
          <Text size={15}>FIBER</Text>
        </Box>
      </Flex>
    </group>
  )
}

export default function App() {
  const scrollArea = useRef()
  const onScroll = (e) => (state.top = e.target.scrollTop)
  useEffect(() => void onScroll({ target: scrollArea.current }), [])
  return (
    <>
      <Canvas concurrent noEvents colorManagement shadowMap onPointerMove={null} camera={{ position: [0, 50, 250] }}>
        <pointLight position={[0, 100, 400]} intensity={0.1} />
        <ambientLight intensity={0.1} />
        <spotLight
          position={[100, 100, 100]}
          penumbra={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={<Html center>loading..</Html>}>
          <Grid />
        </Suspense>
      </Canvas>
      <div className="scrollArea" ref={scrollArea} onScroll={onScroll}>
        <div style={{ height: `${state.pages * 100}vh` }} />
      </div>
    </>
  )
}
