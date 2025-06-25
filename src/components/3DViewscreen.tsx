import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced Types
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
  atmosphere?: boolean;
  clouds?: boolean;
  texture?: string;
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

interface Ship {
  id: number;
  name: string;
  faction: string;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  shields: number;
  hull: number;
  aiState: 'patrol' | 'attack' | 'retreat' | 'idle' | 'friendly';
  isPlayer?: boolean;
}

// Enhanced Planet Component with high-res textures
const Planet3D: React.FC<{ planet: Planet; time: number; systemCenter: [number, number, number] }> = ({ 
  planet, 
  time, 
  systemCenter 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);
  
  // Generate high-resolution procedural textures
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // High resolution
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create gradient and noise for realistic planet surfaces
    const createNoiseTexture = (baseColor: string, secondaryColor: string) => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, secondaryColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add noise for texture detail
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
        const alpha = Math.random() * 0.3;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    
    switch (planet.type) {
      case 'Rocky': {
        createNoiseTexture('#8B4513', '#CD853F');
        // Add rocky formations
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillStyle = `rgba(${139 + Math.random() * 50}, ${69 + Math.random() * 30}, ${19 + Math.random() * 20}, 0.8)`;
          ctx.fillRect(x, y, 10 + Math.random() * 20, 2 + Math.random() * 5);
        }
        break;
      }
      case 'Gas Giant': {
        // Create realistic gas giant bands
        for (let y = 0; y < canvas.height; y += 2) {
          const hue = 200 + Math.sin(y * 0.1) * 40;
          const sat = 60 + Math.sin(y * 0.05) * 20;
          const light = 30 + Math.sin(y * 0.02) * 20;
          ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
          ctx.fillRect(0, y, canvas.width, 2);
        }
        // Add storm systems
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = 20 + Math.random() * 50;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'Earth-like': {
        // Continents and oceans
        ctx.fillStyle = '#4169E1'; // Ocean blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add continents
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const width = 50 + Math.random() * 200;
          const height = 30 + Math.random() * 100;
          
          ctx.fillStyle = `rgba(34, 139, 34, ${0.8 + Math.random() * 0.2})`;
          ctx.beginPath();
          ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'Ice World': {
        createNoiseTexture('#E0FFFF', '#B0E0E6');
        // Add ice formations
        for (let i = 0; i < 300; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
          ctx.beginPath();
          ctx.arc(x, y, 2 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'Desert': {
        createNoiseTexture('#F4A460', '#DEB887');
        // Add dune patterns
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.strokeStyle = `rgba(139, 69, 19, ${0.3 + Math.random() * 0.3})`;
          ctx.lineWidth = 2 + Math.random() * 4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 30 + Math.random() * 50, y + Math.sin(x * 0.1) * 10);
          ctx.stroke();
        }
        break;
      }
      default: {
        ctx.fillStyle = planet.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }, [planet.type, planet.color]);

  // Cloud texture for atmosphere
  const cloudTexture = useMemo(() => {
    if (!planet.clouds) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Generate cloud patterns
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.transparent = true;
    return texture;
  }, [planet.clouds]);

  useFrame(() => {
    if (meshRef.current) {
      // Orbital motion with realistic physics
      const orbitAngle = time * planet.orbitSpeed;
      const x = systemCenter[0] + Math.cos(orbitAngle) * planet.distance;
      const z = systemCenter[2] + Math.sin(orbitAngle) * planet.distance;
      const y = systemCenter[1] + Math.sin(orbitAngle * 0.1) * 0.5; // Slight orbital inclination
      
      meshRef.current.position.set(x, y, z);
      
      // Planet rotation
      meshRef.current.rotation.y += planet.rotationSpeed;
      
      // Update atmosphere
      if (atmosphereRef.current) {
        atmosphereRef.current.position.copy(meshRef.current.position);
        atmosphereRef.current.rotation.y += 0.001;
      }
      
      // Update clouds
      if (cloudsRef.current) {
        cloudsRef.current.position.copy(meshRef.current.position);
        cloudsRef.current.rotation.y += planet.rotationSpeed * 1.1; // Clouds move slightly faster
      }
      
      // Update rings
      if (ringsRef.current && planet.rings) {
        ringsRef.current.position.copy(meshRef.current.position);
        ringsRef.current.rotation.x = Math.PI / 2;
        ringsRef.current.rotation.z += 0.005;
      }
    }
  });

  return (
    <group>
      {/* Main planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.size, 64, 32]} />
        <meshPhongMaterial 
          map={texture}
          shininess={planet.type === 'Ice World' ? 100 : planet.type === 'Gas Giant' ? 10 : 30}
          transparent={false}
        />
      </mesh>
      
      {/* Atmosphere */}
      {planet.atmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[planet.size * 1.05, 32, 16]} />
          <meshPhongMaterial 
            color={planet.type === 'Earth-like' ? '#87CEEB' : '#FFFFFF'}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Clouds */}
      {planet.clouds && cloudTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[planet.size * 1.02, 32, 16]} />
          <meshPhongMaterial 
            map={cloudTexture}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
      
      {/* Planetary rings */}
      {planet.rings && (
        <mesh ref={ringsRef}>
          <ringGeometry args={[planet.size * 1.5, planet.size * 2.5, 64]} />
          <meshBasicMaterial 
            color="#D2B48C" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Orbit trail */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distance - 0.2, planet.distance + 0.2, 128]} />
        <meshBasicMaterial color="#444444" transparent opacity={0.2} />
      </mesh>
      
      {/* Planet name label */}
      <Text
        position={[0, planet.size + 3, 0]}
        fontSize={1.5}
        color="#00FFFF"
        anchorX="center"
        anchorY="middle"
      >
        {planet.name}
      </Text>
      
      {/* Moons */}
      {planet.moons?.map((moon) => (
        <Moon3D 
          key={moon.id} 
          moon={moon} 
          planetPosition={meshRef.current?.position || new THREE.Vector3()} 
          time={time}
        />
      ))}
    </group>
  );
};

// Moon Component
const Moon3D: React.FC<{ moon: Moon; planetPosition: THREE.Vector3; time: number }> = ({ 
  moon, 
  planetPosition, 
  time 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      const orbitAngle = time * moon.orbitSpeed;
      const x = planetPosition.x + Math.cos(orbitAngle) * moon.distance;
      const z = planetPosition.z + Math.sin(orbitAngle) * moon.distance;
      meshRef.current.position.set(x, planetPosition.y, z);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[moon.size, 16, 8]} />
      <meshPhongMaterial color={moon.color} />
    </mesh>
  );
};

// Enhanced Star Component with realistic solar effects
const Star3D: React.FC<{ system: StarSystem; time: number }> = ({ system, time }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      // Realistic stellar pulsing
      const scale = 1 + Math.sin(time * 0.5) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
    
    if (coronaRef.current) {
      coronaRef.current.rotation.y -= 0.002;
      const coronaScale = 1 + Math.sin(time * 0.3) * 0.1;
      coronaRef.current.scale.setScalar(coronaScale);
    }
  });

  return (
    <group>
      {/* Main star */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[system.starSize, 32, 16]} />
        <meshBasicMaterial 
          color={system.starColor}
          emissive={system.starColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Corona effect */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[system.starSize * 1.2, 16, 8]} />
        <meshBasicMaterial 
          color={system.starColor}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Solar flares */}
      {[...Array(8)].map((_, i) => (
        <mesh 
          key={i} 
          rotation={[0, (i * Math.PI * 2) / 8, 0]}
          position={[system.starSize * 1.5, 0, 0]}
        >
          <coneGeometry args={[0.2, 2, 4]} />
          <meshBasicMaterial 
            color={system.starColor} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Lighting */}
      <pointLight 
        color={system.starColor} 
        intensity={3} 
        distance={200}
        decay={2}
      />
    </group>
  );
};

// Enhanced Ship Component with detailed models and AI behavior
const Ship3D: React.FC<{ ship: Ship; time: number; playerPosition?: [number, number, number] }> = ({ 
  ship, 
  time, 
  playerPosition = [0, 0, 0] 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [engineGlow, setEngineGlow] = useState(1);
  
  useFrame(() => {
    if (meshRef.current) {
      // AI movement patterns
      switch (ship.aiState) {
        case 'patrol': {
          // Patrol in a figure-8 pattern
          const patrolRadius = 20;
          const patrolSpeed = 0.5;
          const angle = time * patrolSpeed + ship.id;
          
          ship.position[0] = Math.sin(angle) * patrolRadius;
          ship.position[1] = Math.sin(angle * 2) * 5;
          ship.position[2] = Math.cos(angle) * patrolRadius;
          
          meshRef.current.position.set(...ship.position);
          meshRef.current.lookAt(
            ship.position[0] + Math.cos(angle + Math.PI / 2),
            ship.position[1],
            ship.position[2] + Math.sin(angle + Math.PI / 2)
          );
          break;
        }
        
        case 'attack': {
          // Aggressive pursuit with evasive maneuvers
          const direction = new THREE.Vector3(...playerPosition).sub(new THREE.Vector3(...ship.position));
          const distance = direction.length();
          
          if (distance > 2) {
            direction.normalize();
            // Add evasive pattern
            const evasion = new THREE.Vector3(
              Math.sin(time * 3 + ship.id) * 5,
              Math.cos(time * 2 + ship.id) * 3,
              Math.sin(time * 4 + ship.id) * 4
            );
            
            direction.add(evasion.multiplyScalar(0.3));
            direction.multiplyScalar(0.3);
            
            ship.position[0] += direction.x;
            ship.position[1] += direction.y;
            ship.position[2] += direction.z;
          }
          
          meshRef.current.position.set(...ship.position);
          meshRef.current.lookAt(...playerPosition);
          
          // Banking maneuvers
          meshRef.current.rotation.z = Math.sin(time * 2) * 0.5;
          setEngineGlow(1.5 + Math.sin(time * 5) * 0.5);
          break;
        }
        
        case 'retreat': {
          // Flee from player with random evasion
          const fleeDirection = new THREE.Vector3(...ship.position).sub(new THREE.Vector3(...playerPosition));
          fleeDirection.normalize();
          fleeDirection.multiplyScalar(0.5);
          
          // Add random evasion
          fleeDirection.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.2
          ));
          
          ship.position[0] += fleeDirection.x;
          ship.position[1] += fleeDirection.y;
          ship.position[2] += fleeDirection.z;
          
          meshRef.current.position.set(...ship.position);
          meshRef.current.lookAt(
            ship.position[0] + fleeDirection.x,
            ship.position[1] + fleeDirection.y,
            ship.position[2] + fleeDirection.z
          );
          setEngineGlow(2);
          break;
        }
        
        case 'friendly': {
          // Escort formation
          const escortRadius = 15;
          const escortAngle = time * 0.3 + ship.id * (Math.PI / 2);
          
          ship.position[0] = playerPosition[0] + Math.cos(escortAngle) * escortRadius;
          ship.position[1] = playerPosition[1] + Math.sin(time * 0.5) * 2;
          ship.position[2] = playerPosition[2] + Math.sin(escortAngle) * escortRadius;
          
          meshRef.current.position.set(...ship.position);
          meshRef.current.lookAt(...playerPosition);
          break;
        }
        
        default: {
          // Idle - slight drift
          ship.position[1] += Math.sin(time + ship.id) * 0.01;
          meshRef.current.position.set(...ship.position);
        }
      }
    }
  });

  const getShipModel = (faction: string) => {
    switch (faction) {
      case 'Federation': {
        return (
          <group>
            {/* Saucer section */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[2, 2, 0.5, 16]} />
              <meshPhongMaterial color="#CCCCCC" />
            </mesh>
            {/* Engineering hull */}
            <mesh position={[0, -0.5, -1]}>
              <capsuleGeometry args={[0.8, 2, 4, 8]} />
              <meshPhongMaterial color="#CCCCCC" />
            </mesh>
            {/* Nacelles */}
            <mesh position={[-1.5, -0.3, -2]}>
              <capsuleGeometry args={[0.3, 2, 4, 6]} />
              <meshPhongMaterial color="#4169E1" emissive="#4169E1" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[1.5, -0.3, -2]}>
              <capsuleGeometry args={[0.3, 2, 4, 6]} />
              <meshPhongMaterial color="#4169E1" emissive="#4169E1" emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
      }
      
      case 'Borg': {
        return (
          <group>
            <mesh>
              <boxGeometry args={[3, 3, 3]} />
              <meshPhongMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.2} />
            </mesh>
            {/* Borg details */}
            {[...Array(6)].map((_, i) => (
              <mesh key={i} position={[
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
              ]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshBasicMaterial color="#00FF00" />
              </mesh>
            ))}
          </group>
        );
      }
      
      case 'Klingon': {
        return (
          <group>
            {/* Main hull */}
            <mesh>
              <coneGeometry args={[1.5, 4, 6]} />
              <meshPhongMaterial color="#8B0000" />
            </mesh>
            {/* Wings */}
            <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.3, 3, 0.1]} />
              <meshPhongMaterial color="#8B0000" />
            </mesh>
            <mesh position={[2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.3, 3, 0.1]} />
              <meshPhongMaterial color="#8B0000" />
            </mesh>
          </group>
        );
      }
      
      case 'Romulan': {
        return (
          <group>
            {/* Main hull */}
            <mesh>
              <sphereGeometry args={[1.5, 16, 8]} />
              <meshPhongMaterial color="#006400" />
            </mesh>
            {/* Wings */}
            <mesh position={[-2.5, 0, 0]}>
              <boxGeometry args={[2, 0.2, 1]} />
              <meshPhongMaterial color="#006400" />
            </mesh>
            <mesh position={[2.5, 0, 0]}>
              <boxGeometry args={[2, 0.2, 1]} />
              <meshPhongMaterial color="#006400" />
            </mesh>
          </group>
        );
      }
      
      default: {
        return (
          <mesh>
            <boxGeometry args={[2, 1, 3]} />
            <meshPhongMaterial color="#FF0000" />
          </mesh>
        );
      }
    }
  };

  return (
    <group ref={meshRef}>
      {getShipModel(ship.faction)}
      
      {/* Engine glow */}
      <mesh position={[0, 0, -2]}>
        <sphereGeometry args={[0.5, 8, 4]} />
        <meshBasicMaterial 
          color={ship.faction === 'Federation' ? '#4169E1' : '#FF4500'}
          transparent
          opacity={0.6 * engineGlow}
        />
      </mesh>
      
      {/* Shield effect */}
      {ship.shields > 0 && (
        <mesh>
          <sphereGeometry args={[3.5, 16, 8]} />
          <meshBasicMaterial 
            color={ship.aiState === 'friendly' ? '#00FF00' : '#00FFFF'}
            transparent 
            opacity={0.15}
            wireframe
          />
        </mesh>
      )}
      
      {/* Ship name */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color={ship.aiState === 'friendly' ? '#00FF00' : ship.aiState === 'attack' ? '#FF0000' : '#FFFF00'}
        anchorX="center"
        anchorY="middle"
      >
        {ship.name}
      </Text>
    </group>
  );
};

// Camera Controller with smooth transitions
const CameraController: React.FC<{ 
  mode: string; 
  target?: [number, number, number];
  warpSpeed: number;
}> = ({ mode, target = [0, 0, 0], warpSpeed }) => {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  
  useFrame((state, delta) => {
    targetRef.current.set(...target);
    
    switch (mode) {
      case 'tactical': {
        const idealPosition = new THREE.Vector3(0, 80, 80);
        camera.position.lerp(idealPosition, delta * 2);
        camera.lookAt(targetRef.current);
        break;
      }
      
      case 'pursuit': {
        const idealPosition = new THREE.Vector3(
          target[0] + Math.sin(state.clock.elapsedTime * 0.5) * 10,
          target[1] + 15,
          target[2] + 25
        );
        camera.position.lerp(idealPosition, delta * 3);
        camera.lookAt(targetRef.current);
        break;
      }
      
      case 'orbit': {
        const time = state.clock.elapsedTime * 0.3;
        const radius = 40;
        const idealPosition = new THREE.Vector3(
          target[0] + Math.cos(time) * radius,
          target[1] + 20 + Math.sin(time * 0.5) * 10,
          target[2] + Math.sin(time) * radius
        );
        camera.position.lerp(idealPosition, delta * 1.5);
        camera.lookAt(targetRef.current);
        break;
      }
      
      default: {
        // Bridge forward view
        const idealPosition = new THREE.Vector3(0, 8, 35);
        camera.position.lerp(idealPosition, delta * 2);
        camera.lookAt(0, 0, 0);
      }
    }
    
    // Warp camera shake
    if (warpSpeed > 0) {
      camera.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * warpSpeed * 0.1,
        (Math.random() - 0.5) * warpSpeed * 0.05,
        (Math.random() - 0.5) * warpSpeed * 0.1
      ));
    }
  });

  return null;
};

// Warp Effect
const WarpEffect: React.FC<{ isWarping: boolean; warpSpeed: number }> = ({ isWarping, warpSpeed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isWarping) {
      meshRef.current.rotation.z += warpSpeed * 0.01;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
    }
  });
  
  if (!isWarping) return null;
  
  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.1, 2, 2000, 8]} />
      <meshBasicMaterial 
        color="#00FFFF" 
        transparent 
        opacity={0.4}
        wireframe
      />
    </mesh>
  );
};

// Main 3D Viewscreen Component
const Viewscreen3D: React.FC<{
  currentSystem: StarSystem | null;
  enemies: Ship[];
  viewMode: string;
  warpSpeed: number;
  isWarping: boolean;
}> = ({ currentSystem, enemies, viewMode, warpSpeed, isWarping }) => {
  const [time, setTime] = useState(0);
  const [focusTarget] = useState<[number, number, number]>([0, 0, 0]);
  
  // Enhanced star system with realistic planets
  const enhancedSystem = useMemo(() => {
    if (!currentSystem) return null;
    
    return {
      ...currentSystem,
      planets: currentSystem.planets.map((planet, index) => ({
        ...planet,
        id: planet.id || `planet-${index}`,
        size: 2 + Math.random() * 4,
        distance: 15 + index * 12,
        orbitSpeed: 0.02 / (index + 1),
        rotationSpeed: 0.01 + Math.random() * 0.02,
        atmosphere: planet.type === 'Earth-like' || Math.random() > 0.7,
        clouds: planet.type === 'Earth-like' || planet.type === 'Gas Giant',
        rings: planet.type === 'Gas Giant' && Math.random() > 0.5,
        moons: planet.type === 'Gas Giant' ? 
          [...Array(Math.floor(Math.random() * 4) + 1)].map((_, moonIndex) => ({
            id: `moon-${index}-${moonIndex}`,
            name: `Moon ${moonIndex + 1}`,
            color: '#CCCCCC',
            size: 0.3 + Math.random() * 0.5,
            distance: 8 + moonIndex * 3,
            orbitSpeed: 0.1 + Math.random() * 0.1
          })) : []
      }))
    };
  }, [currentSystem]);
  
  // Add friendly ships to the mix
  const allShips = useMemo(() => {
    const friendlyShips: Ship[] = [
      {
        id: 999,
        name: "USS Enterprise",
        faction: "Federation",
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        rotation: [0, 0, 0],
        shields: 100,
        hull: 100,
        aiState: 'friendly',
        isPlayer: true
      },
      {
        id: 998,
        name: "USS Defiant",
        faction: "Federation",
        position: [10, 2, 5],
        velocity: [0, 0, 0],
        rotation: [0, 0, 0],
        shields: 90,
        hull: 95,
        aiState: 'friendly'
      }
    ];
    
    return [...friendlyShips, ...enemies];
  }, [enemies]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.016); // ~60fps
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas 
        camera={{ position: [0, 8, 35], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1.2} 
          castShadow
        />
        
        {/* Enhanced Starfield */}
        <Stars 
          radius={500} 
          depth={100} 
          count={isWarping ? 2000 : 8000} 
          factor={6} 
          saturation={0.1} 
          fade={isWarping} 
          speed={isWarping ? warpSpeed * 3 : 0.2}
        />
        
        {/* Current Star System */}
        {enhancedSystem && (
          <group>
            <Star3D system={enhancedSystem} time={time} />
            {enhancedSystem.planets.map(planet => (
              <Planet3D 
                key={planet.id} 
                planet={planet} 
                time={time} 
                systemCenter={[0, 0, 0]} 
              />
            ))}
          </group>
        )}
        
        {/* All Ships (Enemy and Friendly) */}
        {allShips.map(ship => (
          <Ship3D 
            key={ship.id} 
            ship={ship} 
            time={time}
            playerPosition={[0, 0, 0]}
          />
        ))}
        
        {/* Warp Effect */}
        <WarpEffect isWarping={isWarping} warpSpeed={warpSpeed} />
        
        {/* Camera Controls */}
        <CameraController mode={viewMode} target={focusTarget} warpSpeed={warpSpeed} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxDistance={200}
          minDistance={5}
        />
      </Canvas>
      
      {/* Enhanced HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top status bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between text-cyan-400 font-mono text-sm">
          <div className="bg-black bg-opacity-50 p-2 rounded">
            <div>VIEW: {viewMode.toUpperCase()}</div>
            {isWarping && <div className="text-orange-400">WARP: {warpSpeed}</div>}
            {enhancedSystem && <div>SYSTEM: {enhancedSystem.name}</div>}
          </div>
          
          <div className="bg-black bg-opacity-50 p-2 rounded text-right">
            <div className="text-red-400">HOSTILE: {allShips.filter(s => s.aiState === 'attack').length}</div>
            <div className="text-green-400">FRIENDLY: {allShips.filter(s => s.aiState === 'friendly').length}</div>
            <div className="text-yellow-400">TOTAL: {allShips.length}</div>
          </div>
        </div>
        
        {/* Tactical grid */}
        {viewMode === 'tactical' && (
          <div className="absolute inset-0">
            <svg className="w-full h-full opacity-20">
              {[...Array(20)].map((_, i) => (
                <g key={i}>
                  <line 
                    x1={`${i * 5}%`} y1="0" 
                    x2={`${i * 5}%`} y2="100%" 
                    stroke="#00FFFF" 
                    strokeWidth="1" 
                  />
                  <line 
                    x1="0" y1={`${i * 5}%`} 
                    x2="100%" y2={`${i * 5}%`} 
                    stroke="#00FFFF" 
                    strokeWidth="1" 
                  />
                </g>
              ))}
            </svg>
          </div>
        )}
        
        {/* Enhanced targeting reticle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-orange-500 border-opacity-70 animate-pulse">
              <div className="w-full h-px bg-orange-500 absolute top-1/2 left-0"></div>
              <div className="w-px h-full bg-orange-500 absolute left-1/2 top-0"></div>
            </div>
            {/* Corner brackets */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-orange-400"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-orange-400"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-orange-400"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-orange-400"></div>
          </div>
        </div>
        
        {/* Planet info panel */}
        {viewMode === 'orbit' && enhancedSystem && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 p-4 rounded border border-cyan-400">
            <h3 className="text-cyan-400 font-bold mb-2">PLANETARY SCAN</h3>
            {enhancedSystem.planets.map((planet) => (
              <div key={planet.id} className="text-xs mb-1">
                <span className="text-yellow-400">{planet.name}:</span>
                <span className="text-white ml-2">{planet.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewscreen3D;