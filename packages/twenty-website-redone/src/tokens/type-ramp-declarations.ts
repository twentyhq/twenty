import { fontSize } from './font-size';
import { mediaUp } from './media-up';
import { TYPE_SCALE, type TypeStep } from './type-scale';

const RUNNING_TEXT_LINE_HEIGHT = '1.55';

const stepDeclarations = (step: TypeStep): string =>
  [
    `font-size: ${fontSize(step.size)};`,
    `line-height: ${
      step.lineHeight === null
        ? RUNNING_TEXT_LINE_HEIGHT
        : fontSize(step.lineHeight)
    };`,
  ].join('\n');

// Emits the stepped font-size/line-height block for a named ramp, including
// its md override when the steps differ.
export const typeRampDeclarations = (ramp: keyof typeof TYPE_SCALE): string => {
  const { base, md } = TYPE_SCALE[ramp];
  const baseBlock = stepDeclarations(base);

  if (base.size === md.size && base.lineHeight === md.lineHeight) {
    return baseBlock;
  }

  return `${baseBlock}\n${mediaUp('md')} {\n${stepDeclarations(md)}\n}`;
};
