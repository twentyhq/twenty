import { styled } from '@linaria/react';

import { isSafeHttpUrl } from '@/partners-marketplace/is-safe-http-url';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  semanticColor,
} from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

const MarkFrame = styled.span`
  align-items: center;
  background-color: ${color('white')};
  border-radius: ${radius(1.5)};
  color: ${color('black')};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${fontFamily('serif')};
  font-weight: ${FONT_WEIGHT.light};
  height: var(--partners-mark-size);
  justify-content: center;
  letter-spacing: -0.02em;
  line-height: 1;
  overflow: hidden;
  width: var(--partners-mark-size);

  /* Initials, without a picture, follow the section's scheme. */
  &[data-initials] {
    background-color: color-mix(in srgb, ${semanticColor.ink} 8%, transparent);
    color: ${semanticColor.ink};
  }
`;

const MarkImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const pickInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// The sample directory inlines its marks; live ones are signed https URLs.
const isRenderableMark = (url: string): boolean =>
  isSafeHttpUrl(url) || url.startsWith('data:image/');

type PartnerMarkProps = {
  markUrl: string;
  name: string;
  sizePx: number;
};
export function PartnerMark({ markUrl, name, sizePx }: PartnerMarkProps) {
  const hasImage = isRenderableMark(markUrl);

  return (
    <MarkFrame
      aria-hidden
      data-initials={hasImage ? undefined : ''}
      style={cssVariableStyle({
        '--partners-mark-size': `${sizePx}px`,
        fontSize: `${Math.round(sizePx * 0.4)}px`,
      })}
    >
      {hasImage ? (
        <MarkImage alt="" loading="lazy" src={markUrl} />
      ) : (
        pickInitials(name)
      )}
    </MarkFrame>
  );
}
