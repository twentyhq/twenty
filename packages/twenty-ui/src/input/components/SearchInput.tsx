import { styled } from '@linaria/react';
import { IconFilter, IconSearch } from '@ui/display';
import { IconButton } from '@ui/input/button/components/IconButton';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { type ChangeEvent, type ReactNode, useContext, useState } from 'react';

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filterDropdown?: (filterButton: ReactNode) => ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
};

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};

  &:focus-within {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledIconContainer = styled.div<{
  isFocused: boolean;
}>`
  align-items: center;
  color: ${({ isFocused }) =>
    isFocused
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.light};
  display: flex;
  justify-content: center;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  &:disabled {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  filterDropdown,
  autoFocus,
  disabled,
  className,
}: SearchInputProps) => {
  const { theme } = useContext(ThemeContext);
  const [isFocused, setIsFocused] = useState(false);

  const filterButton = <IconButton Icon={IconFilter} variant="secondary" />;

  return (
    <StyledWrapper className={className}>
      <StyledInputContainer>
        <StyledIconContainer isFocused={isFocused}>
          <IconSearch size={theme.icon.size.md} />
        </StyledIconContainer>
        <StyledInput
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
        />
      </StyledInputContainer>
      {filterDropdown && filterDropdown(filterButton)}
    </StyledWrapper>
  );
};
