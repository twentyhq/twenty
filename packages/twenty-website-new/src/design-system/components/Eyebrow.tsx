import { Heading, type HeadingType } from '@/design-system/components/Heading';
import { RectangleFillIcon } from '@/icons';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

export type EyebrowType<TText = ReactNode> = { heading: HeadingType<TText> };

const EyebrowRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(2)};
  text-align: start;
`;

const IconWrapper = styled.div`
  align-items: center;
  display: flex;
  height: ${theme.lineHeight(6)};
  justify-content: center;
  width: ${theme.lineHeight(6)};
  flex-shrink: 0;
`;

const eyebrowColorPrimary = css`
  color: ${theme.colors.primary.text[60]};
`;

const eyebrowColorSecondary = css`
  color: ${theme.colors.secondary.text[60]};
`;

const eyebrowLabelClassName = css`
  &&[data-size='xs'] {
    font-size: ${theme.font.size(4.5)};
    line-height: ${theme.lineHeight(6)};
  }
`;

type EyebrowTextRenderer<TText> = [TText] extends [ReactNode]
  ? { renderText?: (text: TText) => ReactNode }
  : { renderText: (text: TText) => ReactNode };

type EyebrowProps<TText = ReactNode> = {
  heading: HeadingType<TText>;
  colorScheme: 'primary' | 'secondary';
  markerHeight?: number;
  markerWidth?: number;
} & EyebrowTextRenderer<TText>;

export function Eyebrow<TText = ReactNode>({
  heading,
  colorScheme,
  markerHeight,
  markerWidth,
  renderText,
}: EyebrowProps<TText>) {
  const colorClassName =
    colorScheme === 'primary' ? eyebrowColorPrimary : eyebrowColorSecondary;
  const headingClassName = [eyebrowLabelClassName, colorClassName].join(' ');
  const headingSegment = {
    fontFamily: heading.fontFamily,
    text: heading.text,
  };

  return (
    <EyebrowRow>
      <IconWrapper>
        <RectangleFillIcon
          fillColor={theme.colors.highlight[100]}
          height={markerHeight}
          size={14}
          width={markerWidth}
        />
      </IconWrapper>
      {renderText === undefined ? (
        <Heading
          as="h3"
          className={headingClassName}
          segments={headingSegment as HeadingType}
          size="xs"
          weight="medium"
        />
      ) : (
        <Heading<TText>
          as="h3"
          className={headingClassName}
          renderText={renderText}
          segments={headingSegment}
          size="xs"
          weight="medium"
        />
      )}
    </EyebrowRow>
  );
}
