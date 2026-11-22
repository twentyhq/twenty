'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { fontFamily, fontSize, radius, semanticColor, spacing } from '@/tokens';

const Card = styled(LocalizedLink)`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('sans')};
  padding: ${spacing(4)};
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${semanticColor.lineStrong};
  }

  & > span {
    color: ${semanticColor.inkMuted};
    display: block;
    font-size: ${fontSize(3.25)};
    margin-top: ${spacing(1)};
  }
`;

// The way into the inspect view: the page alone, full window, with the
// Problems panel.
export function InspectLink({ href }: { href: string }) {
  return (
    <Card href={href}>
      Inspect →
      <span>
        Opens it alone, at the full width of the window, with the Problems
        panel: every hand-written value of its code, file and line.
      </span>
    </Card>
  );
}
