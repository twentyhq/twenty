import { styled } from '@linaria/react';
import { Pill } from '@ui/components';

const StyledSoonPillContainer = styled.span`
  display: flex;
  margin-left: auto;
`;

type ButtonSoonProps = {
  label?: string;
};

export const ButtonSoon = ({ label = 'Soon' }: ButtonSoonProps) => (
  <StyledSoonPillContainer>
    <Pill label={label} />
  </StyledSoonPillContainer>
);
