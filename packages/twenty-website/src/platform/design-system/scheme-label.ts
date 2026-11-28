type SchemeReading = {
  value: string | null;
  source: string;
  text?: string;
  via?: string;
  values?: string[];
  runtime?: string[];
};

// Says where a section's scheme comes from, as the generator read it.
export const schemeLabel = (scheme: SchemeReading) => {
  const via = scheme.via ? `, through ${scheme.via}` : '';
  switch (scheme.source) {
    case 'literal':
      return `${scheme.value}${via}`;
    case 'prop-default':
      return `${scheme.value}, default of its scheme prop${via}`;
    case 'shell-default':
      return `${scheme.value}, SectionShell's default${via}`;
    case 'prop':
      return `set by the page${via}`;
    case 'expression':
      return `decided at runtime: ${scheme.text}${via}`;
    case 'data-scheme':
      return `no SectionShell, sets data-scheme itself: ${[
        ...(scheme.values ?? []),
        ...(scheme.runtime?.length
          ? [`at runtime (${scheme.runtime.join(', ')})`]
          : []),
      ].join(', ')}`;
    default:
      return 'no SectionShell';
  }
};
