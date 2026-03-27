import { LinkButton } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const CtaContainer = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(2)};
  }
`;

export function Cta() {
  return (
    <CtaContainer>
      <LinkButton
        color="secondary"
        href="https://app.twenty.com/welcome"
        label="Log in"
        type="anchor"
        variant="outlined"
      />
      <LinkButton
        color="secondary"
        href="https://app.twenty.com/welcome"
        label="Get started"
        type="anchor"
        variant="contained"
      />
    </CtaContainer>
  );
}
