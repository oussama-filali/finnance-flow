import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { motion } from 'framer-motion'

const AnimatedSphere = () => {
  return (
    <Sphere args={[1, 100, 100]} scale={2}>
      <MeshDistortMaterial
        color="#0ea5e9"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0.2}
      />
    </Sphere>
  )
}

const Scene3D = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="card h-96"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">🌐 Visualisation 3D</h3>
      <div className="h-80 rounded-lg overflow-hidden bg-gradient-to-br from-primary-50 to-golden-50">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AnimatedSphere />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
      </div>
      <p className="text-sm text-gray-600 mt-2 text-center">
        ✨ Effet 3D interactif avec Three.js
      </p>
    </motion.div>
  )
}

export default Scene3D
