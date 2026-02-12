import styled from '@emotion/styled';
import { Pill } from '@ui/components';

const StyledSoonPill = styled(Pill)`
  margin-left: auto;
`;

export type ButtonSoonProps = {
  label?: string;
};

export const ButtonSoon = ({ label = 'Soon' }: ButtonSoonProps) => (
  <StyledSoonPill label={label} />
);
