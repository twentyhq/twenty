// Fullscreen image pass: contain/cover fit, preview zoom, contrast — the
// band composite samples its output. Ported verbatim.
export const IMAGE_PASS_SHADER = {
  fragment: /* glsl */ `
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 viewportSize;
  uniform float zoom;
  uniform float contrast;
  uniform float imageFit;

  varying vec2 vUv;

  void main() {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;

    vec2 uv = vUv;

    if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;
      if (imageFit > 0.5) {
        uv.x = (uv.x - 0.5) * scale + 0.5;
      } else {
        uv.y = (uv.y - 0.5) / scale + 0.5;
      }
    } else {
      float scale = imageAspect / viewAspect;
      if (imageFit > 0.5) {
        uv.y = (uv.y - 0.5) * scale + 0.5;
      } else {
        uv.x = (uv.x - 0.5) / scale + 0.5;
      }
    }

    uv = (uv - 0.5) / zoom + 0.5;

    float inBounds = step(0.0, uv.x) * step(uv.x, 1.0)
                   * step(0.0, uv.y) * step(uv.y, 1.0);

    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));
    vec3 contrastColor = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(contrastColor, inBounds);
  }
`,
};
