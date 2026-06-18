import * as THREE from 'three';

import { HALFTONE_FOOTPRINT } from '../engine/footprint';

import { HALFTONE_FOOTPRINT_RUNTIME_SOURCE } from './footprint-runtime-source';

describe('halftone footprint helpers', () => {
  it('computes the visible contained image rect', () => {
    expect(
      HALFTONE_FOOTPRINT.getContainedImageRect({
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
      HALFTONE_FOOTPRINT.getContainedImageRect({
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
      HALFTONE_FOOTPRINT.getImageFootprintScale({
        imageHeight: 1000,
        imageWidth: 1000,
        previewDistance: HALFTONE_FOOTPRINT.referencePreviewDistance,
        viewportHeight: 600,
        viewportWidth: 800,
      }),
    ).toBeCloseTo(1);

    expect(
      HALFTONE_FOOTPRINT.getImageFootprintScale({
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
      HALFTONE_FOOTPRINT.getMeshFootprintScale({
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
      getContainedImageRect: typeof HALFTONE_FOOTPRINT.getContainedImageRect;
      getImageFootprintScale: typeof HALFTONE_FOOTPRINT.getImageFootprintScale;
      getMeshFootprintScale: typeof HALFTONE_FOOTPRINT.getMeshFootprintScale;
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
      HALFTONE_FOOTPRINT.getContainedImageRect({ ...imageArgs, zoom: 1 }),
    );
    expect(runtime.getImageFootprintScale(imageArgs)).toBeCloseTo(
      HALFTONE_FOOTPRINT.getImageFootprintScale(imageArgs),
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
      HALFTONE_FOOTPRINT.getMeshFootprintScale(meshArgs),
      6,
    );
  });
});
