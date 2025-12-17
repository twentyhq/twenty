import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Pill } from '@ui/components';

const StyledSoonPill = styled(Pill)`
  margin-left: auto;
`;

export const ButtonSoon = () => <StyledSoonPill label={t`Soon`} />;
