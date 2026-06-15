import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useCallback } from "react";
import * as THREE from "three";

interface RopeProps {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  sagAmount?: number;
  color?: string;
  radius?: number;
  minSegments?: number;
  maxSegments?: number;
}

// Shared geometry and material for all rope instances
const sharedGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 6);
const sharedMaterial = new THREE.MeshStandardMaterial({
  color: "#A25016",
});

export const Rope = ({
  startPosition,
  endPosition,
  sagAmount = 0.25,
  color = "#8B4513",
  radius = 0.02,
  minSegments = 8,
  maxSegments = 16,
}: RopeProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const prevSegmentCount = useRef<number>(0);
  const lastStartPosition = useRef(new THREE.Vector3());
  const lastEndPosition = useRef(new THREE.Vector3());
  const updateThreshold = 0.01; // Only update if positions changed by more than 1cm
  const tempVectors = useRef({
    point1: new THREE.Vector3(),
    point2: new THREE.Vector3(),
    midPoint: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    minBounds: new THREE.Vector3(),
    maxBounds: new THREE.Vector3(),
    center: new THREE.Vector3(),
    scale: new THREE.Vector3(),
    upVector: new THREE.Vector3(0, 1, 0),
  });
  const tempMatrix = useRef(new THREE.Matrix4());
  const tempQuaternion = useRef(new THREE.Quaternion());

  // Create material with custom color if needed
  const material = useMemo(() => {
    if (color === "#8B4513") {
      return sharedMaterial;
    }
    return new THREE.MeshStandardMaterial({
      color,
    });
  }, [color]);

  // Create geometry with custom radius if needed
  const geometry = useMemo(() => {
    if (radius === 0.02) {
      return sharedGeometry;
    }
    return new THREE.CylinderGeometry(radius, radius, 1, 6);
  }, [radius]);

  // Calculate segments count based on distance
  const calculateSegments = useCallback(
    (distance: number): number => {
      return Math.min(
        maxSegments,
        Math.max(minSegments, Math.floor(distance * 3)),
      );
    },
    [minSegments, maxSegments],
  );

  // Calculate rope sag position
  const calculateSagPosition = useCallback(
    (
      start: THREE.Vector3,
      end: THREE.Vector3,
      t: number,
      sag: number,
      target: THREE.Vector3,
    ): THREE.Vector3 => {
      target.lerpVectors(start, end, t);
      target.y -= 4 * sag * t * (1 - t);
      return target;
    },
    [],
  );

  useFrame(() => {
    if (!meshRef.current) return;

    // Only update if positions changed significantly
    const startMoved =
      lastStartPosition.current.distanceTo(startPosition) > updateThreshold;
    const endMoved =
      lastEndPosition.current.distanceTo(endPosition) > updateThreshold;

    if (!startMoved && !endMoved) {
      return; // Skip update if positions haven't changed much
    }

    // Update last positions
    lastStartPosition.current.copy(startPosition);
    lastEndPosition.current.copy(endPosition);

    const distance = startPosition.distanceTo(endPosition);
    const segments = calculateSegments(distance);
    const sag = distance * sagAmount;

    // Update instance count if segments changed
    if (segments !== prevSegmentCount.current) {
      meshRef.current.count = segments;
      prevSegmentCount.current = segments;
    }

    const {
      point1,
      point2,
      midPoint,
      direction,
      minBounds,
      maxBounds,
      center,
      scale,
      upVector,
    } = tempVectors.current;
    const { current: matrix } = tempMatrix;
    const { current: quaternion } = tempQuaternion;

    // Track bounds for frustum culling - reuse temp vectors
    minBounds.set(Infinity, Infinity, Infinity);
    maxBounds.set(-Infinity, -Infinity, -Infinity);

    // Update all instances
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;

      // Calculate positions with sag using temp vectors
      calculateSagPosition(startPosition, endPosition, t1, sag, point1);
      calculateSagPosition(startPosition, endPosition, t2, sag, point2);

      // Calculate segment properties
      direction.subVectors(point2, point1);
      const segmentLength = direction.length();

      // Calculate position and orientation
      midPoint.addVectors(point1, point2).multiplyScalar(0.5);
      direction.normalize();
      quaternion.setFromUnitVectors(upVector, direction);

      // Create transformation matrix - reuse temp scale vector
      scale.set(1, segmentLength, 1);
      matrix.compose(midPoint, quaternion, scale);

      // Set instance matrix
      meshRef.current.setMatrixAt(i, matrix);

      // Update bounds
      minBounds.min(point1);
      minBounds.min(point2);
      maxBounds.max(point1);
      maxBounds.max(point2);
    }

    // Mark instances as needing update
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update bounding box to prevent frustum culling
    if (meshRef.current.geometry.boundingBox) {
      meshRef.current.geometry.boundingBox.min.copy(minBounds);
      meshRef.current.geometry.boundingBox.max.copy(maxBounds);
    } else {
      meshRef.current.geometry.boundingBox = new THREE.Box3(
        minBounds.clone(),
        maxBounds.clone(),
      );
    }

    // Update bounding sphere as well - reuse temp center vector
    center.addVectors(minBounds, maxBounds).multiplyScalar(0.5);
    const radius = center.distanceTo(maxBounds);
    if (meshRef.current.geometry.boundingSphere) {
      meshRef.current.geometry.boundingSphere.center.copy(center);
      meshRef.current.geometry.boundingSphere.radius = radius;
    } else {
      meshRef.current.geometry.boundingSphere = new THREE.Sphere(
        center.clone(),
        radius,
      );
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, maxSegments]}
      count={0}
      castShadow
      frustumCulled={false}
    />
  );
};
