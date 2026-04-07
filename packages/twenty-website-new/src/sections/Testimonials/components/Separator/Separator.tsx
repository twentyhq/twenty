import { PlusIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledSeparator = styled.div`
  align-items: center;
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: auto 1fr auto;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    width: auto;
  }
`;

const SeparatorLine = styled.div`
  background-color: ${theme.colors.primary.border[20]};
  height: 1px;
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 100%;
    justify-self: center;
    min-height: 0;
    width: 1px;
  }
`;

const SeparatorIcon = styled.div`
  align-items: center;
  display: grid;
  justify-items: center;
  padding-left: ${theme.spacing(1.5)};
  padding-right: ${theme.spacing(1.5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(1.5)};
    padding-left: 0;
    padding-right: 0;
    padding-top: ${theme.spacing(1.5)};
  }
`;

export function Separator() {
  return (
    <StyledSeparator>
      <SeparatorIcon>
        <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
      </SeparatorIcon>
      <SeparatorLine />
      <SeparatorIcon>
        <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
      </SeparatorIcon>
    </StyledSeparator>
  );
}
