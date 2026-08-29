import { styled } from '@linaria/react';

import {
  color,
  fontFamily,
  fontSize,
  FONT_WEIGHT,
  GRADIENT,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { CASE_STUDY_CARD_ASPECT_RATIO } from './case-study-card-aspect-ratio';

const PlaceholderFrame = styled.div`
  aspect-ratio: ${CASE_STUDY_CARD_ASPECT_RATIO};
  background:
    radial-gradient(120% 90% at 12% 0%, ${color('blue')}14, transparent 55%),
    ${GRADIENT.heroGlow};
  overflow: hidden;
  position: relative;
  width: 100%;

  &::before {
    background-image:
      linear-gradient(${semanticColor.line} 1px, transparent 1px),
      linear-gradient(90deg, ${semanticColor.line} 1px, transparent 1px);
    background-size: ${spacing(6)} ${spacing(6)};
    content: '';
    inset: 0;
    opacity: 0.65;
    pointer-events: none;
    position: absolute;
  }
`;

const PlaceholderInner = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

const ClientMark = styled.span`
  backdrop-filter: blur(6px);
  background: ${color('white-80')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.16em;
  line-height: 1;
  padding: ${spacing(2.5)} ${spacing(4)};
  text-transform: uppercase;

  [data-scheme='dark'] & {
    background: ${color('black-40')};
  }
`;

function clientInitials(client: string): string {
  const words = client.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return 'CS';
  }

  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }

  return `${words[0]!.charAt(0)}${words[1]!.charAt(0)}`.toUpperCase();
}

export function CaseStudyPlaceholder({ client }: { client: string }) {
  return (
    <PlaceholderFrame aria-hidden="true">
      <PlaceholderInner>
        <ClientMark>{clientInitials(client)}</ClientMark>
      </PlaceholderInner>
    </PlaceholderFrame>
  );
}
