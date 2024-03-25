import {
  CallToActionContainer,
  LinkNextToCTA,
  StyledButton,
} from '@/app/_components/ui/layout/header/styled';

export const CallToAction = () => {
  return (
    <CallToActionContainer>
      <LinkNextToCTA href="https://app.twenty.com">Sign in</LinkNextToCTA>
      <a href="https://app.twenty.com">
        <StyledButton>Get Started</StyledButton>
      </a>
    </CallToActionContainer>
  );
};
