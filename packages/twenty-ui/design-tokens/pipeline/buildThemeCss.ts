import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { GENERATED_CSS_HEADER } from './generatedCssHeader';
import { selectSquircleDoubledRadiusLeaves } from './selectSquircleDoubledRadiusLeaves';

const SQUIRCLE_COMMENT = `/* Squircle corners: progressive enhancement for browsers supporting
   corner-shape (Chromium 139+). A squircle needs ~2x the radius of a round
   corner to read as the same visual size, so the radius tokens are doubled
   here; other browsers keep the base tokens as plain rounded corners.

   Shape rules:
   - pill, rounded and the *-round tokens are never doubled: they belong to
     elements that keep corner-shape: round (circles, capsules, checkboxes,
     chips, tags) and must look identical in both modes.
   - Opt a subtree out of squircles with --t-corner-shape: round, or a
     single element with corner-shape: round.
   - Nested radii must stay concentric in both modes: derive them from the
     parent radius token minus the inset, e.g.
     calc(var(--t-border-radius-md) - var(--t-spacing-1)).
     The token doubles under squircle while the inset does not, which is
     exactly what concentricity requires. */`;

const ZERO_SPECIFICITY_COMMENT =
  '  /* Zero specificity on purpose: any component rule can override it. */';

const extractSquircleBasePx = (leaf: CollectedTokenLeaf): number => {
  const match = leaf.light.match(/^(\d+)px$/);
  if (match === null || leaf.light !== leaf.dark) {
    throw new Error(
      `Squircle-doubled radius token "${leaf.varName}" must be a scheme-invariant integer px value, got light "${leaf.light}" / dark "${leaf.dark}".`,
    );
  }
  return Number(match[1]);
};

export const buildThemeCss = ({
  leaves,
  scheme,
}: {
  leaves: CollectedTokenLeaf[];
  scheme: 'light' | 'dark';
}): string => {
  const declarations = leaves
    .map(
      (leaf) =>
        `  ${leaf.varName}: ${scheme === 'light' ? leaf.light : leaf.dark};`,
    )
    .join('\n');

  const doubledDeclarations = selectSquircleDoubledRadiusLeaves(leaves)
    .map((leaf) => `    ${leaf.varName}: ${extractSquircleBasePx(leaf) * 2}px;`)
    .join('\n');

  return `${GENERATED_CSS_HEADER}

.${scheme} {
${declarations}
}

${SQUIRCLE_COMMENT}
@supports (corner-shape: squircle) {
  .${scheme} {
${doubledDeclarations}
  }

${ZERO_SPECIFICITY_COMMENT}
  *,
  *::before,
  *::after {
    corner-shape: var(--t-corner-shape, squircle);
  }
}
`;
};
