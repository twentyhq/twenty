import {
  Body as BaseBody,
  type BodyProps,
} from '@/design-system/components/Body/Body';
import { Pages } from '@/enums/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const BodyContainer = styled.div`
  color: ${theme.colors.primary.text[60]};
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(6)});
  width: 360px;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page=${Pages.Home}] {
      width: 591px;
    }

    &[data-page=${Pages.Partner}] {
      width: 500px;
    }

    &[data-page=${Pages.Pricing}] {
      width: 500px;
    }

    &[data-page=${Pages.Product}] {
      width: 591px;
    }

    &[data-page=${Pages.WhyTwenty}] {
      width: 443px;
      color: ${theme.colors.secondary.text[100]};
    }
  }
`;

export type HeroBodyProps = BodyProps & { page: Pages };

export function Body({ page, ...bodyProps }: HeroBodyProps) {
  return (
    <BodyContainer data-page={page}>
      <BaseBody {...bodyProps} />
    </BodyContainer>
  );
}
