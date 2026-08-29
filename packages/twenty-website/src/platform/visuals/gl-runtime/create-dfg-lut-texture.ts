import { Texture } from 'ogl';

import { type VisualRenderingContext } from './create-visual-renderer';

// three's precomputed split-sum BRDF table (16x16 RG16F, 4096 samples per
// texel), copied verbatim from three/src/renderers/shaders/DFGLUTData.js.
// Both the direct multiscatter term and EnvironmentBRDF read it, so copying
// it is what makes this material match MeshPhysicalMaterial rather than
// approximate it.
const DFG_LUT_BASE64 =
  'tTDROkwxTTrSMxw57zUoOPM3pjbRODk1eTkQNPg5UjJTOvAwlDrJL786NS7aOgUt6DofLO064CrqOtEp4Tr/KDg25DhKNs44mTZeOE43LDc5OKQ13DhiNG45xDLeOTQxKzoDMFk6Oi5tOuEsbjq6K186MypJOgopLTomKAo66CaUONc2lzjJNqM4dTa8OKw17jicND45MjOXOYYx4jk4MBM6dS4pOvUsLTqsKyE6/ykEOrwo3DmQJ605GiZ4OfokrDmoNKw5ozSuOYA0rjkjNLE5DjPCOakx4DljMPw5tS4MOh0tFDrPKwc6/ynpOaMovjk8J4k5syVKOYgkBzlFI3c6IzJ2Oh8yczoEMmo6szFYOhQxRTo7MDQ6ti4mOjEtHjrvKws6DSrsOaEowDkbJ4c5gCVEOUkk+ji9Iqw4VSEHO8ovBjvKLwA7uC/0Onwv2zrqLrQ6AC6FOuwsXjrFKzY6ACoNOpko3DkHJ6A5YiVaOSQkCzloIrc4/SBfONEfaTu5LGg7uyxiO7ssVjuuLDs7eCwNOwoszzrjKpI6mClUOmcoFzrQJtM5PCWJOQIkNTkmItw4vSB9OFQfHTizHak7aymoO28pozt7KZg7hyl/O3YpTjsnKQ47lSjCOrcnczo7JiM65yTQOZsjdjnZIRc5fiCyOOceSzhTHcc3HhzSO8sl0TvTJc078CXCOx8mrTtFJn07LSY+O8Ql7DoPJZM6OiQyOs4i0DlbIWk5KiD+OG4ejzjxHB84mxtiN90Z6TurIek7tyHlO+Uh3TtBIsk7pyKgO+wiYjvNIg87RyKuOnUhRDqIINQ5SR9gOb4d6Th3HHA46BrxN1MZCDcbGPY76hz2O/sc8zs4Hew7vR3aO3wetzslH307eR8sO0wfxjqmHlU6ux3aOb0cWjmdG9g4ABpVOKwYqzc8F7c2mBX8OzYX/DtZF/k75xf0O5YY5DuXGcY7qBqRO4QbQzvSG946ihtlOs0a4jnTGVc5zRjKOLMXPjgTFm03vxRvNl4T/zsbEP87ORD8O8gQ+TsmEuo7KBTPO4QVnzvFFlQ7mhfwOs4XdjpxF+o5pBZWOacVvzinFCk4eRM1N+oRLTahEAA8GwYAPGoG/jscCPo7TArtOxYN1TuzD6k7TRFjO3wSATsvE4U6RBP0OdISVzkNErU4IhEXODwQAzfTDvA1bQ0APHoAADyJAP47HQH7O3wC8Dv6BNo7gQixO80KbzuXDBA7ew2TOvEN/jnvDVk5ig2vOOkMCDgxDNU28Aq5NaMJADwAAAA8AQD/OxUA+ztZAPI7/QDdO98BtzscA3k7fAQdO9QFoDrVBgg6WgddOV4Hqjj3BvQ3SAasNnYFhjWfBA==';

const DFG_LUT_SIZE = 16;

export function createDfgLutTexture(gl: VisualRenderingContext) {
  const binary = atob(DFG_LUT_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Texture(gl, {
    image: new Uint16Array(bytes.buffer),
    width: DFG_LUT_SIZE,
    height: DFG_LUT_SIZE,
    format: WebGL2RenderingContext.RG,
    internalFormat: WebGL2RenderingContext.RG16F,
    type: WebGL2RenderingContext.HALF_FLOAT,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    generateMipmaps: false,
    flipY: false,
  });
}
