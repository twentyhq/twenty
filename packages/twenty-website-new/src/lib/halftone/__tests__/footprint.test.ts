import {
  getContainedImageRect,
  getImageFootprintScale,
  getMeshFootprintScale,
  REFERENCE_PREVIEW_DISTANCE,
} from '@/lib/halftone/utils/footprint';
import { HALFTONE_FOOTPRINT_RUNTIME_SOURCE } from '@/lib/halftone/generated/footprint-runtime-source';
import * as THREE from 'three';

describe('halftone footprint helpers', () => {
  it('computes the visible contained image rect', () => {
    expect(
      getContainedImageRect({
        imageHeight: 500,
        imageWidth: 1000,
        viewportHeight: 800,
        viewportWidth: 800,
        zoom: 1,
      }),
    ).toEqual({
      x: 0,
      y: 200,
      width: 800,
      height: 400,
    });
  });

  it('computes the visible covered image rect', () => {
    expect(
      getContainedImageRect({
        imageFit: 'cover',
        imageHeight: 500,
        imageWidth: 1000,
        viewportHeight: 800,
        viewportWidth: 800,
        zoom: 1,
      }),
    ).toEqual({
      x: 0,
      y: 0,
      width: 800,
      height: 800,
    });
  });

  it('derives image footprint scale from preview distance', () => {
    expect(
      getImageFootprintScale({
        imageHeight: 1000,
        imageWidth: 1000,
        previewDistance: REFERENCE_PREVIEW_DISTANCE,
        viewportHeight: 600,
        viewportWidth: 800,
      }),
    ).toBeCloseTo(1);

    expect(
      getImageFootprintScale({
        imageHeight: 1000,
        imageWidth: 1000,
        previewDistance: 8,
        viewportHeight: 600,
        viewportWidth: 800,
      }),
    ).toBeCloseTo(0.5, 5);
  });

  it('derives mesh footprint scale from projected bounds', () => {
    const camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 100);
    const target = new THREE.Vector3(0, 0, 0);
    camera.position.set(0, 0, 8);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    expect(
      getMeshFootprintScale({
        camera,
        localBounds: new THREE.Box3(
          new THREE.Vector3(-0.5, -0.5, -0.5),
          new THREE.Vector3(0.5, 0.5, 0.5),
        ),
        lookAtTarget: target,
        meshMatrixWorld: new THREE.Matrix4(),
        viewportHeight: 600,
        viewportWidth: 800,
      }),
    ).toBeCloseTo(0.5, 1);
  });

  it('keeps the exported runtime helpers aligned with the typed helpers', () => {
    const runtime = new Function(
      'THREE',
      `${HALFTONE_FOOTPRINT_RUNTIME_SOURCE}
return { getContainedImageRect, getImageFootprintScale, getMeshFootprintScale };`,
    )(THREE) as {
      getContainedImageRect: typeof getContainedImageRect;
      getImageFootprintScale: typeof getImageFootprintScale;
      getMeshFootprintScale: typeof getMeshFootprintScale;
    };

    const imageArgs = {
      imageFit: 'cover' as const,
      imageHeight: 1000,
      imageWidth: 1600,
      previewDistance: 6,
      viewportHeight: 720,
      viewportWidth: 1280,
    };

    expect(runtime.getContainedImageRect({ ...imageArgs, zoom: 1 })).toEqual(
      getContainedImageRect({ ...imageArgs, zoom: 1 }),
    );
    expect(runtime.getImageFootprintScale(imageArgs)).toBeCloseTo(
      getImageFootprintScale(imageArgs),
      6,
    );

    const camera = new THREE.PerspectiveCamera(45, 1280 / 720, 0.1, 100);
    const lookAtTarget = new THREE.Vector3(0, 0, 0);
    camera.position.set(0, 0, 8);
    camera.lookAt(lookAtTarget);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const meshArgs = {
      camera,
      localBounds: new THREE.Box3(
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(0.5, 0.5, 0.5),
      ),
      lookAtTarget,
      meshMatrixWorld: new THREE.Matrix4(),
      viewportHeight: 720,
      viewportWidth: 1280,
    };

    expect(runtime.getMeshFootprintScale(meshArgs)).toBeCloseTo(
      getMeshFootprintScale(meshArgs),
      6,
    );
  });
});
