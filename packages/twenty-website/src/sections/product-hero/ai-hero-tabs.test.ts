import { PRODUCT_VISUAL_SCENES } from '@/app-preview/product-visual/product-visual-scenes';

import { AI_HERO_TABS } from './ai-hero-tabs';

describe('AI_HERO_TABS', () => {
  it('should map tab N onto scene N+1 (scene 0 is the collaborative intro)', () => {
    expect(AI_HERO_TABS.length + 1).toBe(PRODUCT_VISUAL_SCENES.length);
  });

  it('should keep every tab pointing at an AI scene with playable steps', () => {
    AI_HERO_TABS.forEach((_tab, index) => {
      const scene = PRODUCT_VISUAL_SCENES[index + 1];
      expect(scene.steps?.length ?? 0).toBeGreaterThan(0);
      expect(scene.responseText.length).toBeGreaterThan(0);
    });
  });
});
