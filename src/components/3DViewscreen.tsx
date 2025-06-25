import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Types
interface Planet {
  id: string;
  name: string;
  type: string;
  color: string;
  size: number;
  distance: number;
  orbitSpeed: number;
  rotationSpeed: number;
  position: [number, number, number];
  rings?: boolean;
  moons?: Moon[];
}

interface Moon {
  id: string;
  name: string;
  color: string;
  size: number;
  distance: number;
  orbitSpeed: number;
}

interface StarSystem {
  id: string;
  name: string;
  starColor: string;
  starSize: number;
  planets: Planet[];
}

interface Enemy {
  id: number;
  name: string;
  faction: string;
  position: [number, number, number];
  velocity: [number, number, number];
  model: string;
  shields: number;
  hull: number;
  aiState: 'patrol' | 'attack' | 'retreat' | 'idle';
}

// 3D Planet Component
const Planet3D: React.FC<{ planet: Planet; time: number; systemCenter: [number, number, number] }> = ({ 
  planet, 
  time, 
  systemCenter 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Orbital motion
      const orbitAngle = time * planet.orbitSpeed;
      const x = systemCenter[0] + Math.cos(orbitAngle) * planet.distance;
      const z = systemCenter[2] + Math.sin(orbitAngle) * planet.distance;
      meshRef.current.position.set(x, systemCenter[1], z);
      
      // Rotation
      meshRef.current.rotation.y += planet.rotationSpeed;
    }
  });

  const getTexture = (type: string) => {
    // Create procedural textures based on planet type
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    switch (type) {
      case 'Rocky': {
        // Brown/orange rocky texture
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#CD853F');
        gradient.addColorStop(1, '#A0522D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      }
      case 'Gas Giant': {
        // Banded gas giant
        for (let i = 0; i < canvas.height; i += 20) {
          const hue = (i / canvas.height) * 60 + 200;
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          ctx.fillRect(0, i, canvas.width, 15);
        }
        break;
      }
      case 'Ice World': {
        // Icy blue-white
        ctx.fillStyle = '#E0FFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      }
      case 'Desert': {
        // Sandy yellow
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      }
      default: {
        ctx.fillStyle = planet.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = 2;
    return texture;
  };

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.size, 32, 16]} />
        <meshPhongMaterial 
          map={getTexture(planet.type)}
          shininess={planet.type === 'Ice World' ? 100 : 30}
        />
      </mesh>
      
      {/* Orbit trail */}
      <mesh>
        <ringGeometry args={[planet.distance - 0.1, planet.distance + 0.1, 64]} />
        <meshBasicMaterial color="#444444" transparent opacity={0.3} />
      </mesh>
      
      {/* Planet name label */}
      <Text
        position={[0, planet.size + 2, 0]}
        fontSize={1}
        color="#00FFFF"
        anchorX="center"
        anchorY="middle"
      >
        {planet.name}
      </Text>
    </group>
  );
};

// 3D Star Component
const Star3D: React.FC<{ system: StarSystem; time: number }> = ({ system, time }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      // Pulsing effect
      const scale = 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[system.starSize, 32, 16]} />
      <meshBasicMaterial 
        color={system.starColor}
        emissive={system.starColor}
        emissiveIntensity={0.5}
      />
      <pointLight color={system.starColor} intensity={2} distance={100} />
    </mesh>
  );
};

// 3D Enemy Ship Component
const EnemyShip3D: React.FC<{ enemy: Enemy; time: number }> = ({ enemy, time }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // AI movement patterns
      switch (enemy.aiState) {
        case 'patrol': {
          meshRef.current.position.x += Math.sin(time + enemy.id) * 0.1;
          meshRef.current.position.z += Math.cos(time + enemy.id) * 0.1;
          break;
        }
        case 'attack': {
          // Move towards player (assuming player at origin)
          const direction = new THREE.Vector3(0, 0, 0).sub(meshRef.current.position).normalize();
          meshRef.current.position.add(direction.multiplyScalar(0.2));
          break;
        }
        case 'retreat': {
          // Move away from player
          const retreatDirection = meshRef.current.position.clone().normalize();
          meshRef.current.position.add(retreatDirection.multiplyScalar(0.3));
          break;
        }
      }
      
      // Rotation based on faction
      switch (enemy.faction) {
        case 'Borg': {
          // Slow, mechanical rotation
          meshRef.current.rotation.x += 0.005;
          meshRef.current.rotation.y += 0.005;
          meshRef.current.rotation.z += 0.005;
          break;
        }
        case 'Klingon': {
          // Aggressive banking maneuvers
          meshRef.current.rotation.z = Math.sin(time * 2) * 0.3;
          break;
        }
        case 'Romulan': {
          // Smooth, calculated movements
          meshRef.current.rotation.y += 0.02;
          break;
        }
      }
    }
  });

  const getShipModel = (faction: string) => {
    switch (faction) {
      case 'Borg':
        return (
          <boxGeometry args={[2, 2, 2]} />
        );
      case 'Klingon':
        return (
          <coneGeometry args={[1, 3, 3]} />
        );
      case 'Romulan':
        return (
          <cylinderGeometry args={[0.5, 1.5, 3, 8]} />
        );
      default:
        return (
          <boxGeometry args={[1, 0.5, 2]} />
        );
    }
  };

  const getShipColor = (faction: string) => {
    switch (faction) {
      case 'Borg': return '#00FF00';
      case 'Klingon': return '#8B0000';
      case 'Romulan': return '#004d00';
      case 'Cardassian': return '#FFD700';
      default: return '#FF0000';
    }
  };

  return (
    <mesh ref={meshRef} position={enemy.position}>
      {getShipModel(enemy.faction)}
      <meshPhongMaterial 
        color={getShipColor(enemy.faction)}
        emissive={getShipColor(enemy.faction)}
        emissiveIntensity={0.2}
      />
      
      {/* Shield effect */}
      {enemy.shields > 0 && (
        <mesh>
          <sphereGeometry args={[2.5, 16, 8]} />
          <meshBasicMaterial 
            color="#00FFFF" 
            transparent 
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </mesh>
  );
};

// Camera Controller
const CameraController: React.FC<{ mode: string; target?: [number, number, number] }> = ({ 
  mode, 
  target = [0, 0, 0] 
}) => {
  const { camera } = useThree();
  
  useFrame(() => {
    switch (mode) {
      case 'tactical': {
        camera.position.set(0, 50, 50);
        camera.lookAt(target[0], target[1], target[2]);
        break;
      }
      case 'pursuit': {
        camera.position.set(target[0], target[1] + 10, target[2] + 20);
        camera.lookAt(target[0], target[1], target[2]);
        break;
      }
      case 'orbit': {
        const time = Date.now() * 0.001;
        camera.position.set(
          target[0] + Math.cos(time) * 30,
          target[1] + 15,
          target[2] + Math.sin(time) * 30
        );
        camera.lookAt(target[0], target[1], target[2]);
        break;
      }
      default: {
        // Default bridge view
        camera.position.set(0, 5, 30);
        camera.lookAt(0, 0, 0);
      }
    }
  });

  return null;
};

// Main 3D Viewscreen Component
const Viewscreen3D: React.FC<{
  currentSystem: StarSystem | null;
  enemies: Enemy[];
  viewMode: string;
  warpSpeed: number;
  isWarping: boolean;
}> = ({ currentSystem, enemies, viewMode, warpSpeed, isWarping }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.016); // ~60fps
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas camera={{ position: [0, 5, 30], fov: 75 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        
        {/* Starfield */}
        <Stars 
          radius={300} 
          depth={50} 
          count={isWarping ? 1000 : 5000} 
          factor={4} 
          saturation={0} 
          fade={isWarping} 
          speed={isWarping ? warpSpeed * 2 : 0.5}
        />
        
        {/* Current Star System */}
        {currentSystem && (
          <group>
            <Star3D system={currentSystem} time={time} />
            {currentSystem.planets.map(planet => (
              <Planet3D 
                key={planet.id} 
                planet={planet} 
                time={time} 
                systemCenter={[0, 0, 0]} 
              />
            ))}
          </group>
        )}
        
        {/* Enemy Ships */}
        {enemies.map(enemy => (
          <EnemyShip3D key={enemy.id} enemy={enemy} time={time} />
        ))}
        
        {/* Warp Effect */}
        {isWarping && (
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 1000, 8]} />
            <meshBasicMaterial 
              color="#00FFFF" 
              transparent 
              opacity={0.6}
              wireframe
            />
          </mesh>
        )}
        
        {/* Camera Controls */}
        <CameraController mode={viewMode} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm">
          <div>VIEW MODE: {viewMode.toUpperCase()}</div>
          {isWarping && <div>WARP: {warpSpeed}</div>}
          {currentSystem && <div>SYSTEM: {currentSystem.name}</div>}
        </div>
        
        <div className="absolute top-4 right-4 text-cyan-400 font-mono text-sm">
          <div>THREATS: {enemies.filter(e => e.aiState === 'attack').length}</div>
          <div>CONTACTS: {enemies.length}</div>
        </div>
        
        {/* Targeting reticle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-orange-500 border-opacity-50">
            <div className="w-full h-px bg-orange-500 absolute top-1/2 left-0"></div>
            <div className="w-px h-full bg-orange-500 absolute left-1/2 top-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewscreen3D;