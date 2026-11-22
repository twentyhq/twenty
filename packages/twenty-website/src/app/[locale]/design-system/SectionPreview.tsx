import { SECTION_PREVIEWS } from './section-previews';

// A section as its pages render it: inside the same context roots.
export function SectionPreview({ previewKey }: { previewKey: string }) {
  const preview = SECTION_PREVIEWS[previewKey];
  if (!preview) return null;
  const { Section, wrappers } = preview;
  return wrappers.reduceRight(
    (node, Wrapper) => <Wrapper>{node}</Wrapper>,
    <Section />,
  );
}
