import * as THREE from "three";

export const cloneSkinned = <T extends THREE.Object3D>(source: T): T => {
  const sourceLookup = new Map<THREE.Object3D, THREE.Object3D>();
  const cloneLookup = new Map<THREE.Object3D, THREE.Object3D>();

  const clone = source.clone(true) as T;

  parallelTraverse(source, clone, (sourceNode, clonedNode) => {
    sourceLookup.set(clonedNode, sourceNode);
    cloneLookup.set(sourceNode, clonedNode);
  });

  clone.traverse((node: any) => {
    if (!node.isSkinnedMesh) return;

    const clonedMesh = node as THREE.SkinnedMesh;
    const sourceMesh = sourceLookup.get(node) as THREE.SkinnedMesh;

    clonedMesh.skeleton = sourceMesh.skeleton.clone();
    clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

    clonedMesh.skeleton.bones = sourceMesh.skeleton.bones.map(
      (bone) => cloneLookup.get(bone) as THREE.Bone,
    );

    clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
  });

  return clone;
};

const parallelTraverse = (
  a: THREE.Object3D,
  b: THREE.Object3D,
  callback: (a: THREE.Object3D, b: THREE.Object3D) => void,
) => {
  callback(a, b);

  for (let i = 0; i < a.children.length; i++) {
    parallelTraverse(a.children[i], b.children[i], callback);
  }
};
