// Jest stand-in for @lingui/core/macro: the real `msg` is compiled away
// by the SWC plugin at build time; tests only need a MessageDescriptor
// shape whose id is the source text.
export const msg = (
  strings: TemplateStringsArray,
  ...expressions: unknown[]
): { id: string } => ({
  id: String.raw({ raw: strings }, ...expressions),
});
