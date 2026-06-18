import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

// The product draws a colored, photo-less avatar from a color4 surface with
// color12 text (twenty-front hashes the name to the tone; the mockup data
// assigns it). Baked per tone from the product ramp — gray is the base and
// the unknown-tone fallback; our `teal` is the product's turquoise.
const AvatarFrame = styled.div<{ $size: number }>`
  align-items: center;
  background: ${THEME_LIGHT.color.gray4};
  border-radius: 50%;
  color: ${THEME_LIGHT.color.gray12};
  display: flex;
  flex: 0 0 auto;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${({ $size }) =>
    $size <= 12 ? '8px' : $size <= 14 ? '10px' : '12px'};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  height: ${({ $size }) => `${$size}px`};
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: ${({ $size }) => `${$size}px`};

  &[data-square] {
    border-radius: ${THEME_LIGHT.border.radius.xs};
  }

  &[data-tone='amber'] {
    background: ${THEME_LIGHT.color.amber4};
    color: ${THEME_LIGHT.color.amber12};
  }
  &[data-tone='blue'] {
    background: ${THEME_LIGHT.color.blue4};
    color: ${THEME_LIGHT.color.blue12};
  }
  &[data-tone='green'] {
    background: ${THEME_LIGHT.color.green4};
    color: ${THEME_LIGHT.color.green12};
  }
  &[data-tone='orange'] {
    background: ${THEME_LIGHT.color.orange4};
    color: ${THEME_LIGHT.color.orange12};
  }
  &[data-tone='pink'] {
    background: ${THEME_LIGHT.color.pink4};
    color: ${THEME_LIGHT.color.pink12};
  }
  &[data-tone='purple'] {
    background: ${THEME_LIGHT.color.purple4};
    color: ${THEME_LIGHT.color.purple12};
  }
  &[data-tone='red'] {
    background: ${THEME_LIGHT.color.red4};
    color: ${THEME_LIGHT.color.red12};
  }
  &[data-tone='teal'] {
    background: ${THEME_LIGHT.color.turquoise4};
    color: ${THEME_LIGHT.color.turquoise12};
  }
`;

export function PreviewAvatar({
  children,
  size = 14,
  square = false,
  tone = 'gray',
}: {
  children: ReactNode;
  size?: number;
  square?: boolean;
  tone?: string;
}) {
  return (
    <AvatarFrame
      $size={size}
      data-square={square ? '' : undefined}
      data-tone={tone}
    >
      {children}
    </AvatarFrame>
  );
}
