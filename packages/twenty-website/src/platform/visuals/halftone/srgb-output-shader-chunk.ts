// three expanded `#include <colorspace_fragment>` into this, because the
// composites render to the default framebuffer and the renderer ran with
// outputColorSpace = SRGBColorSpace. ogl passes shader source through
// untouched, so the encode has to be written out or every composite draws its
// linear values raw and the whole page reads too dark.
//
// Copied from three's colorspace_pars_fragment (sRGBTransferOETF). Alpha is
// deliberately untouched: these composites are transparent.
//
// The matching `#include <tonemapping_fragment>` is not reproduced — it is
// guarded by `#if defined( TONE_MAPPING )` and these scenes never set a tone
// mapping mode, so it compiled to nothing.
export const SRGB_OUTPUT_SHADER_CHUNK = /* glsl */ `
  vec4 sRGBTransferOETF(in vec4 value) {
    return vec4(
      mix(
        pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055),
        value.rgb * 12.92,
        vec3(lessThanEqual(value.rgb, vec3(0.0031308)))
      ),
      value.a
    );
  }
`;
