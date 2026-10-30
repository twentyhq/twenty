import { isAiFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/is-ai-front-component.util';

it.each([
  ['src/ai-front-components/component.front-component.tsx', true],
  ['src/ai-front-components/other.front-component.tsx', false],
  ['src/components/component.tsx', false],
])('classifies %s as AI: %s', (sourceComponentPath, expected) => {
  expect(
    isAiFrontComponent({
      id: 'component',
      sourceComponentPath,
    }),
  ).toBe(expected);
});
