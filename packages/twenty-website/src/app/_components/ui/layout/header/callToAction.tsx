import {
  CallToActionContainer,
  LinkNextToCTA,
  StyledButton,
} from '@/app/_components/ui/layout/header/styled';

export const CallToAction = () => {
  return (
    <CallToActionContainer>
      <LinkNextToCTA href="https://github.com/twentyhq/twenty">
        Sign in
      </LinkNextToCTA>
      <a href="https://twenty.com/stripe-redirection">
        <StyledButton>Get Started</StyledButton>
      </a>
    </CallToActionContainer>
  );
};
