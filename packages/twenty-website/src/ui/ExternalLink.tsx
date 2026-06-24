import { type AnchorHTMLAttributes } from 'react';

// The one place the new-tab security attributes exist. Styled variants wrap
// this (styled(ExternalLink)); React 19 forwards ref as a prop.
export function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a rel="noopener noreferrer" target="_blank" {...props} />;
}
