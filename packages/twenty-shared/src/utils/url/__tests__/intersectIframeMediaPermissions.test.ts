import { intersectIframeMediaPermissions } from '../intersectIframeMediaPermissions';

const PHONE_ORIGIN = 'https://phone.example.com';
const VIDEO_ORIGIN = 'https://video.example.com';

describe('intersectIframeMediaPermissions', () => {
  it('drops origins missing from the allowed permissions', () => {
    expect(
      intersectIframeMediaPermissions({
        permissions: [
          { origin: PHONE_ORIGIN, microphone: true, camera: false },
          { origin: VIDEO_ORIGIN, microphone: true, camera: true },
        ],
        allowedPermissions: [
          { origin: PHONE_ORIGIN, microphone: true, camera: false },
        ],
      }),
    ).toEqual([{ origin: PHONE_ORIGIN, microphone: true, camera: false }]);
  });

  it('keeps only the capabilities both sides grant', () => {
    expect(
      intersectIframeMediaPermissions({
        permissions: [
          { origin: VIDEO_ORIGIN, microphone: true, camera: false },
        ],
        allowedPermissions: [
          { origin: VIDEO_ORIGIN, microphone: true, camera: true },
        ],
      }),
    ).toEqual([{ origin: VIDEO_ORIGIN, microphone: true, camera: false }]);
  });

  it('drops origins left without any capability', () => {
    expect(
      intersectIframeMediaPermissions({
        permissions: [
          { origin: VIDEO_ORIGIN, microphone: false, camera: true },
        ],
        allowedPermissions: [
          { origin: VIDEO_ORIGIN, microphone: true, camera: false },
        ],
      }),
    ).toEqual([]);
  });
});
