import { buildSchemeDeclarations } from './build-scheme-declarations';
import { type Scheme } from './scheme';
import { semanticColor } from './semantic-color';

// Adopting a scheme is two things at once: defining the semantic variables AND
// applying the ink colour that inheriting text resolves to. Text that sets no
// colour of its own (Heading, Body) reads the inherited `color`, so a region
// that sets only the variables leaves that text on the previous scheme's ink.
// This is the single, complete definition — the section shell and any nested
// surface (a dark panel inside a light section) adopt a scheme through it, so
// the two halves can never drift apart. A filled surface adds its own
// `background-color: semanticColor.surface`; a panel drawn over an existing
// shape does not.
export function buildSchemeContext(scheme: Scheme): string {
  return `${buildSchemeDeclarations(scheme)}
color: ${semanticColor.ink};`;
}
