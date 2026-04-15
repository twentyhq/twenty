import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { HeadingType } from './types/Heading';

const headingRootClassName = css`
  margin: 0;

  &[data-weight='light'] {
    font-weight: ${theme.font.weight.light};
  }

  &[data-weight='regular'] {
    font-weight: ${theme.font.weight.regular};
  }

  &[data-weight='medium'] {
    font-weight: ${theme.font.weight.medium};
  }

  &[data-size='xl'] {
    font-size: ${theme.font.size(15)};
    line-height: ${theme.lineHeight(16.5)};
  }

  &[data-size='lg'] {
    font-size: ${theme.font.size(10)};
    line-height: ${theme.lineHeight(11.5)};
  }

  &[data-size='md'] {
    font-size: ${theme.font.size(10)};
    line-height: ${theme.lineHeight(11.5)};
  }

  &[data-size='sm'] {
    font-size: ${theme.font.size(8)};
    line-height: ${theme.lineHeight(10)};
  }

  &[data-size='xs'] {
    font-size: ${theme.font.size(4.5)};
    line-height: ${theme.lineHeight(6)};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-size='xl'] {
      font-size: ${theme.font.size(20)};
      line-height: ${theme.lineHeight(21.5)};
    }

    &[data-size='lg'] {
      font-size: ${theme.font.size(15)};
      line-height: ${theme.lineHeight(16.5)};
    }

    &[data-size='md'] {
      font-size: ${theme.font.size(12)};
      line-height: ${theme.lineHeight(14)};
    }

    &[data-size='sm'] {
      font-size: ${theme.font.size(8)};
      line-height: ${theme.lineHeight(10)};
    }

    &[data-size='xs'] {
      font-size: ${theme.font.size(5.5)};
      line-height: ${theme.lineHeight(7)};
    }
  }
`;

const StyledSpan = styled.span`
  &[data-family='sans'] {
    font-family: ${theme.font.family.sans};
    letter-spacing: -0.04em;
  }

  &[data-family='serif'] {
    font-family: ${theme.font.family.serif};
    letter-spacing: -0.02em;
  }

  &[data-family='mono'] {
    font-family: ${theme.font.family.mono};
    letter-spacing: -0.04em;
  }

  &[data-weight='light'] {
    font-weight: ${theme.font.weight.light};
  }

  &[data-weight='regular'] {
    font-weight: ${theme.font.weight.regular};
  }

  &[data-weight='medium'] {
    font-weight: ${theme.font.weight.medium};
  }
`;

export type HeadingAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingFamily = 'sans' | 'serif' | 'mono';
export type HeadingWeight = 'light' | 'regular' | 'medium';
export type HeadingSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export type HeadingProps = {
  as?: HeadingAs;
  segments: HeadingType | HeadingType[];
  weight?: HeadingWeight;
  size?: HeadingSize;
  className?: string;
};

export function Heading({
  as: Tag = 'h1',
  segments,
  weight = 'regular',
  size = 'md',
  className,
}: HeadingProps) {
  const rootClassName = [headingRootClassName, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={rootClassName} data-weight={weight} data-size={size}>
      {Array.isArray(segments) ? (
        segments.map((segment, index) => {
          const lineBreakBefore =
            segment.newLine === true || segment.lineBreakBefore === true;

          return (
            <Fragment key={index}>
              {lineBreakBefore ? <br /> : null}
              <StyledSpan
                data-family={segment.fontFamily}
                data-weight={segment.fontWeight}
              >
                {segment.text}
              </StyledSpan>
            </Fragment>
          );
        })
      ) : (
        <StyledSpan
          data-family={segments.fontFamily}
          data-weight={segments.fontWeight}
        >
          {segments.text}
        </StyledSpan>
      )}
    </Tag>
  );
}
