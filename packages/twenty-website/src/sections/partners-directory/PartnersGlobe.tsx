'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { isDefined } from 'twenty-shared/utils';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { createVisualRenderer } from '@/platform/visuals/three-runtime/create-visual-renderer';
import {
  buildSchemeDeclarations,
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  paletteColorNumber,
  type PaletteToken,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import {
  GLOBE_FACING_ZOOM,
  GLOBE_FOV_DEGREES,
  GLOBE_RADIUS,
  GLOBE_VIEW,
  globeFacingCameraDistance,
} from './globe-view';
import { PLACE_POINT_FEATURED_SCALE, placePointClassName } from './place-point';
import { PartnerMark } from './PartnerMark';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';

// The partners hero globe: the land of Natural Earth (land-mask.png, 0.25°,
// equirectangular) lit from the side, drawn as a halftone of dots, with each
// partner at its city. One partner at a time shows its name.
const LAND_MASK_URL = '/images/partners/hero/land-mask.png';

const RADIUS = GLOBE_RADIUS;
const FOV_DEGREES = GLOBE_FOV_DEGREES;
// The sphere's silhouette fills the square box exactly.
const CAMERA_DISTANCE = RADIUS / Math.sin((FOV_DEGREES / 2) * (Math.PI / 180));
const AUTO_SPIN = 0.0008;
const FEATURE_MS = 2800;
const DEGREES = Math.PI / 180;

const HALFTONE = {
  cellPx: 7,
  power: -1.8,
  // the fullest cells stretch into a dash the cell's width, so neighbours join
  dotScale: 1,
  landBase: 0.5,
  landLit: 0.38,
  ocean: 0.47,
} as const;

// Under the cursor the dots swell, as the site's halftone backdrops do.
const HOVER = {
  radiusPx: 140,
  lift: 0.22,
  easeIn: 0.12,
  easeOut: 0.06,
} as const;

const toVector = (latitude: number, longitude: number, r: number) => {
  const phi = latitude * DEGREES;
  const lambda = longitude * DEGREES;
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.sin(lambda),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lambda),
  );
};

const TONE_VERTEX = /* glsl */ `
  varying vec3 vObject; varying vec3 vNormal; varying vec3 vView;
  void main() {
    vObject = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

// Lit land bright, ocean faint, the rim falling off to nothing.
const TONE_FRAGMENT = /* glsl */ `
  uniform sampler2D uLand; uniform vec3 uLight;
  uniform float uLandBase; uniform float uLandLit; uniform float uOcean;
  varying vec3 vObject; varying vec3 vNormal; varying vec3 vView;
  void main() {
    vec3 p = normalize(vObject);
    float latitude = asin(clamp(p.y, -1.0, 1.0));
    float longitude = atan(p.x, p.z);
    // the mask's first row is 90°N (flipY off)
    vec2 uv = vec2(longitude / 6.2831853 + 0.5, 0.5 - latitude / 3.1415927);
    float land = texture2D(uLand, uv).r;
    float diffuse = max(dot(vNormal, normalize(uLight)), 0.0);
    float facing = max(dot(vNormal, vView), 0.0);
    float lit = uLandBase + uLandLit * diffuse;
    float tone = mix(uOcean * smoothstep(0.0, 0.5, facing), lit, land)
      * smoothstep(0.0, 0.25, facing);
    gl_FragColor = vec4(vec3(tone), 1.0);
  }`;

const HALFTONE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// The site's halftone (halftone-pass-shader.ts): one sample per cell, the
// tone biased by the power, drawn as a capsule that grows with the tone: a
// small dot where the globe is faint (the ocean), a fuller dot in between, a
// horizontal dash where it is lit (the land), so dots and dashes mix in the
// same rows as the hero's pattern.
const HALFTONE_FRAGMENT = /* glsl */ `
  uniform sampler2D tScene; uniform vec2 effectResolution; uniform vec2 logicalResolution;
  uniform float cell; uniform float power; uniform float dotScale; uniform vec3 dotColor;
  uniform vec2 pointer; uniform float hover; uniform float hoverRadius; uniform float hoverLift;
  varying vec2 vUv;
  void main() {
    vec2 frag = (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;
    vec2 cellIndex = floor(frag / cell);
    vec2 sampleUv = clamp((cellIndex + 0.5) * cell / logicalResolution, vec2(0.0), vec2(1.0));
    vec4 scene = texture2D(tScene, sampleUv);
    float tone = (scene.r + scene.g + scene.b) / 3.0;
    vec2 cellCenter = (cellIndex + 0.5) * cell;
    float near = smoothstep(hoverRadius, 0.0, distance(cellCenter, pointer)) * hover;
    // only where the sphere is: the lift never draws dots off the globe
    float onSphere = step(0.001, tone);
    float level = clamp(tone + power * 0.2357 + near * hoverLift * onSphere, 0.0, 1.0);
    float alpha = 0.0;
    if (level > 0.0001) {
      vec2 f = fract(frag / cell) - 0.5;
      float aa = 1.0 / cell;
      float roundness = 0.08 + 0.3 * level;
      // the power leaves the lit land around 0.3-0.5: that range stretches into dashes
      float stretch = 0.5 * dotScale * smoothstep(0.22, 0.5, level);
      float d = length(vec2(max(abs(f.x) - stretch, 0.0), f.y));
      alpha = (1.0 - smoothstep(roundness - aa, roundness + aa, d))
        * smoothstep(0.02, 0.08, scene.a);
    }
    gl_FragColor = vec4(dotColor * alpha, alpha);
  }`;

const Frame = styled.div`
  inset: 0;
  position: absolute;

  canvas {
    cursor: grab;
    display: block;
    height: 100%;
    inset: 0;
    position: absolute;
    width: 100%;
  }

  canvas:active {
    cursor: grabbing;
  }
`;

const Overlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

// Placed each frame from the globe: the point's centre at --x / --y.
const Placed = styled.div`
  display: none;
  left: 0;
  opacity: var(--opacity, 0);
  position: absolute;
  top: 0;
  transform: translate(var(--x), var(--y));
`;

// A partner's place: a small blue dot ringed in white, with a wider hit
// area. The one showing its tag sends out a slow ring.
// Positioned and hit-tested here; its look is the shared place point. It
// lies on the sphere as the halftone does: towards the rim it flattens along
// the surface's slope (--tilt, the screen direction of the sphere's normal;
// --squash, how far it faces the camera), so it rides the curve instead of
// sliding over it.
const GlobePoint = styled.span`
  cursor: pointer;
  left: 0;
  pointer-events: auto;
  position: absolute;
  top: 0;
  /* The featured grow eases on its own property; the lie on the sphere
     changes every frame, so it never transitions. */
  scale: var(--point-scale, 1);
  transform: translate(-50%, -50%) rotate(var(--tilt, 0deg))
    scale(var(--squash, 1), 1) rotate(calc(-1 * var(--tilt, 0deg)));
  transition: scale ${DURATION.sm} ${EASING.standard};

  &::before {
    content: '';
    inset: calc(-1 * ${spacing(2)});
    position: absolute;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// The directory card's mark, name and mono place line, above the point.
// A light island: on a profile the globe sits in a dark band, where the
// section's ink turns white; the tag keeps its own light scheme.
const Tag = styled.div`
  ${buildSchemeDeclarations('light')}
  align-items: center;
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  bottom: ${spacing(5)};
  display: flex;
  gap: ${spacing(2)};
  left: 0;
  padding: ${spacing(1.5)} ${spacing(3)} ${spacing(1.5)} ${spacing(1.5)};
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
`;

const TagName = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const TagPlace = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

type GlobePartner = {
  slug: string;
  name: string;
  city: string;
  markUrl: string;
  position: THREE.Vector3;
};

type PartnersGlobeProps = {
  // The dots' colour: blue on the partners hero, the region's on a profile.
  accent?: PaletteToken;
  // A profile turns the globe to its partner's place, [longitude, latitude],
  // and holds it there in place of the hero's slow spin.
  facing?: readonly [number, number];
  // How close a facing globe ends, in globe heights per frame height.
  facingZoom?: number;
  partners: readonly MarketplacePartner[];
};

// How fast a profile's globe settles on its partner, and how far off it starts.
const FACING_EASE = 0.03;
const FACING_START_OFFSET = 40 * DEGREES;
// A profile opens on the whole globe, then the camera closes in on the
// partner's region (GLOBE_FACING_ZOOM).
const FACING_ZOOM_EASE = 0.025;
// The hero lights the globe from the left; a profile lights it nearly from the
// front, so the region it faces, in the middle, is the lit part.
const HERO_LIGHT = [-0.7, 0.55, 0.6] as const;
const FACING_LIGHT = [-0.3, 0.35, 0.9] as const;

export function PartnersGlobe({
  accent = 'blue',
  facing,
  facingZoom = GLOBE_FACING_ZOOM,
  partners,
}: PartnersGlobeProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const placedRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // a hovered point holds its tag
  const hoveredRef = useRef<number | null>(null);

  // Only a known city or country gets a point, as on the directory cards.
  const globePartners = useMemo<GlobePartner[]>(
    () =>
      partners.flatMap((partner) => {
        const coordinates = resolvePartnerCoordinates(
          partner.city ?? '',
          partner.country ?? '',
        );
        if (!isDefined(coordinates)) {
          return [];
        }
        const [longitude, latitude] = coordinates;
        return [
          {
            slug: partner.slug,
            name: partner.name,
            city: partner.city || partner.country,
            markUrl: partner.profilePictureUrl,
            position: toVector(latitude, longitude, RADIUS * 1.004),
          },
        ];
      }),
    [partners],
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!isDefined(frame)) {
      return;
    }
    const renderer = createVisualRenderer({ alpha: true, antialias: true });
    if (!isDefined(renderer)) {
      return;
    }
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.autoClear = false;
    frame.prepend(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(FOV_DEGREES, 1, 0.1, 100);
    camera.position.set(0, 0, CAMERA_DISTANCE);

    const toneScene = new THREE.Scene();
    const tiltGroup = new THREE.Group();
    // a profile tips its partner's latitude to the front
    tiltGroup.rotation.x = isDefined(facing)
      ? facing[1] * DEGREES
      : GLOBE_VIEW.pose.rotationX;
    const globe = new THREE.Group();
    tiltGroup.add(globe);
    toneScene.add(tiltGroup);

    const landTexture = new THREE.TextureLoader().load(LAND_MASK_URL);
    landTexture.flipY = false;
    landTexture.minFilter = THREE.LinearFilter;
    landTexture.generateMipmaps = false;

    const sphereGeometry = new THREE.SphereGeometry(RADIUS, 128, 96);
    const toneMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uLand: { value: landTexture },
        uLight: {
          value: new THREE.Vector3(
            ...(isDefined(facing) ? FACING_LIGHT : HERO_LIGHT),
          ),
        },
        uLandBase: { value: HALFTONE.landBase },
        uLandLit: { value: HALFTONE.landLit },
        uOcean: { value: HALFTONE.ocean },
      },
      vertexShader: TONE_VERTEX,
      fragmentShader: TONE_FRAGMENT,
    });
    globe.add(new THREE.Mesh(sphereGeometry, toneMaterial));

    const toneTarget = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
    });
    const halftoneMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tScene: { value: toneTarget.texture },
        effectResolution: { value: new THREE.Vector2() },
        logicalResolution: { value: new THREE.Vector2() },
        cell: { value: HALFTONE.cellPx },
        power: { value: HALFTONE.power },
        dotScale: { value: HALFTONE.dotScale },
        dotColor: { value: new THREE.Color(paletteColorNumber(accent)) },
        pointer: { value: new THREE.Vector2(-9999, -9999) },
        hover: { value: 0 },
        hoverRadius: { value: HOVER.radiusPx },
        hoverLift: { value: HOVER.lift },
      },
      vertexShader: HALFTONE_VERTEX,
      fragmentShader: HALFTONE_FRAGMENT,
    });
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quadScene = new THREE.Scene();
    quadScene.add(new THREE.Mesh(quadGeometry, halftoneMaterial));
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // drag to turn, then ease back to the slow spin
    const facingSpin = isDefined(facing) ? -facing[0] * DEGREES : undefined;
    let spin = isDefined(facingSpin)
      ? facingSpin + (reducedMotion ? 0 : FACING_START_OFFSET)
      : GLOBE_VIEW.pose.rotationY;
    let velocity = AUTO_SPIN;
    const facingDistance = globeFacingCameraDistance(facingZoom);
    let cameraDistance =
      isDefined(facing) && reducedMotion ? facingDistance : CAMERA_DISTANCE;
    let dragging = false;
    let lastX = 0;
    const canvas = renderer.domElement;
    const onDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      velocity = (event.clientX - lastX) * 0.004;
      lastX = event.clientX;
      spin += velocity;
    };
    const onUp = () => {
      dragging = false;
    };
    let hoverTarget = 0;
    const onHoverMove = (event: PointerEvent) => {
      const bounds = frame.getBoundingClientRect();
      // gl_FragCoord runs from the bottom
      halftoneMaterial.uniforms.pointer.value.set(
        event.clientX - bounds.left,
        bounds.bottom - event.clientY,
      );
      hoverTarget = 1;
    };
    const onHoverLeave = () => {
      hoverTarget = 0;
    };
    canvas.addEventListener('pointermove', onHoverMove);
    canvas.addEventListener('pointerleave', onHoverLeave);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let width = 1;
    let height = 1;
    const resize = () => {
      width = Math.max(frame.clientWidth, 1);
      height = Math.max(frame.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      toneTarget.setSize(width * pixelRatio, height * pixelRatio);
      halftoneMaterial.uniforms.effectResolution.value.set(
        width * pixelRatio,
        height * pixelRatio,
      );
      halftoneMaterial.uniforms.logicalResolution.value.set(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    resize();

    let visible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    visibilityObserver.observe(frame);

    const world = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const surfaceTip = new THREE.Vector3();
    const shown = globePartners.map(() => 0);
    let featured = -1;
    let featuredAt = -Infinity;
    let animationFrame = 0;

    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!visible) return;

      if (!dragging && isDefined(facingSpin)) {
        // a profile's globe eases onto its partner and stays there
        spin += (facingSpin - spin) * (reducedMotion ? 1 : FACING_EASE);
        cameraDistance += (facingDistance - cameraDistance) * FACING_ZOOM_EASE;
        camera.position.z = cameraDistance;
      } else if (!dragging) {
        // a hovered point stays under the cursor
        const spinTarget = isDefined(hoveredRef.current) ? 0 : AUTO_SPIN;
        velocity += (spinTarget - velocity) * 0.08;
        if (!reducedMotion) spin += velocity;
      }
      globe.rotation.y = spin;
      tiltGroup.updateMatrixWorld(true);
      const hoverUniform = halftoneMaterial.uniforms.hover;
      hoverUniform.value +=
        (hoverTarget - hoverUniform.value) *
        (hoverTarget > hoverUniform.value ? HOVER.easeIn : HOVER.easeOut);

      // The hero cuts the box: only what shows above its bottom edge counts.
      const banner = frame.parentElement?.parentElement;
      const visibleBottom = isDefined(banner)
        ? banner.getBoundingClientRect().bottom -
          frame.getBoundingClientRect().top
        : height;

      const placed = globePartners.map((partner) => {
        world.copy(partner.position).applyMatrix4(globe.matrixWorld);
        const towardCamera = world
          .clone()
          .normalize()
          .dot(toCamera.copy(camera.position).sub(world).normalize());
        // a step out along the sphere's normal, on screen: the way the
        // surface slopes away at this place
        surfaceTip
          .copy(world)
          .addScaledVector(world.clone().normalize(), 0.05)
          .project(camera);
        world.project(camera);
        const x = (world.x * 0.5 + 0.5) * width;
        const y = (-world.y * 0.5 + 0.5) * height;
        const tilt = Math.atan2(
          (-surfaceTip.y * 0.5 + 0.5) * height - y,
          (surfaceTip.x * 0.5 + 0.5) * width - x,
        );
        const inView = towardCamera > 0.15 && y < visibleBottom - 8;
        return {
          tilt,
          towardCamera,
          x,
          y,
          inView,
          canFeature:
            inView && towardCamera > 0.35 && x > 120 && x < width - 120,
        };
      });

      const hovered = hoveredRef.current;
      if (isDefined(hovered) && (placed[hovered]?.inView ?? false)) {
        featured = hovered;
        featuredAt = now;
      } else if (
        now - featuredAt > FEATURE_MS ||
        !(placed[featured]?.canFeature ?? false)
      ) {
        const pool = placed.flatMap((entry, index) =>
          entry.canFeature && index !== featured ? [index] : [],
        );
        if (pool.length > 0) {
          featured = reducedMotion
            ? pool[0]
            : pool[Math.floor(Math.random() * pool.length)];
          featuredAt = now;
        }
      }

      placed.forEach((entry, index) => {
        const element = placedRefs.current[index];
        const tag = tagRefs.current[index];
        if (!isDefined(element)) return;
        if (!entry.inView) {
          element.style.display = 'none';
          return;
        }
        shown[index] +=
          ((index === featured ? 1 : 0) - shown[index]) *
          (reducedMotion ? 1 : 0.12);
        element.style.display = 'block';
        // the featured partner's tag sits over its neighbours' points
        element.style.zIndex = index === featured ? '1' : '0';
        const point = pointRefs.current[index];
        if (isDefined(point)) {
          point.toggleAttribute('data-featured', index === featured);
          point.style.setProperty(
            '--point-scale',
            index === featured ? String(PLACE_POINT_FEATURED_SCALE) : '1',
          );
          point.style.setProperty(
            '--tilt',
            `${THREE.MathUtils.radToDeg(entry.tilt).toFixed(1)}deg`,
          );
          point.style.setProperty(
            '--squash',
            THREE.MathUtils.clamp(entry.towardCamera, 0.3, 1).toFixed(3),
          );
        }
        element.style.setProperty('--x', `${entry.x.toFixed(1)}px`);
        element.style.setProperty('--y', `${entry.y.toFixed(1)}px`);
        element.style.setProperty(
          '--opacity',
          THREE.MathUtils.smoothstep(entry.towardCamera, 0.15, 0.4).toFixed(3),
        );
        if (isDefined(tag)) {
          tag.style.opacity = shown[index].toFixed(3);
          tag.style.visibility = shown[index] < 0.01 ? 'hidden' : 'visible';
        }
      });

      renderer.setRenderTarget(toneTarget);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(toneScene, camera);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(quadScene, quadCamera);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointermove', onHoverMove);
      canvas.removeEventListener('pointerleave', onHoverLeave);
      sphereGeometry.dispose();
      quadGeometry.dispose();
      toneMaterial.dispose();
      halftoneMaterial.dispose();
      landTexture.dispose();
      toneTarget.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [accent, facing, facingZoom, globePartners]);

  return (
    <Frame ref={frameRef}>
      <Overlay>
        {globePartners.map((partner, index) => (
          <Placed
            key={partner.slug}
            ref={(element) => {
              placedRefs.current[index] = element;
            }}
          >
            <GlobePoint
              className={placePointClassName}
              onPointerEnter={() => {
                hoveredRef.current = index;
              }}
              onPointerLeave={() => {
                hoveredRef.current = null;
              }}
              ref={(element) => {
                pointRefs.current[index] = element;
              }}
            />
            <Tag
              ref={(element) => {
                tagRefs.current[index] = element;
              }}
              style={{ opacity: 0, visibility: 'hidden' }}
            >
              <PartnerMark
                markUrl={partner.markUrl}
                name={partner.name}
                sizePx={24}
              />
              <TagName>{partner.name}</TagName>
              <TagPlace>{partner.city}</TagPlace>
            </Tag>
          </Placed>
        ))}
      </Overlay>
    </Frame>
  );
}
