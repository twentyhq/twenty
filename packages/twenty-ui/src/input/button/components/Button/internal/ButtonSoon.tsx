import { styled } from '@linaria/react';
import { Pill } from '@ui/components';

const StyledSoonPill = styled(Pill)`
  margin-left: auto;
`;

export const ButtonSoon = () => <StyledSoonPill label="Soon" />;
