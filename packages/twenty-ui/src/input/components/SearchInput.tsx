import { styled } from '@linaria/react';
import { IconFilter, IconSearch } from '@ui/display';
import { IconButton } from '@ui/input/button/components/IconButton';
import { ThemeContext, themeVar } from '@ui/theme';
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
  gap: ${themeVar.spacing[2]};
  width: 100%;
`;

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${themeVar.background.transparent.lighter};
  border: 1px solid ${themeVar.border.color.medium};
  border-radius: ${themeVar.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  gap: ${themeVar.spacing[1]};
  height: 32px;
  padding: 0 ${themeVar.spacing[2]};

  &:focus-within {
    border-color: ${themeVar.color.blue};
  }
`;

const StyledIconContainer = styled.div<{
  isFocused: boolean;
}>`
  align-items: center;
  color: ${({ isFocused }) =>
    isFocused ? themeVar.font.color.secondary : themeVar.font.color.light};
  display: flex;
  justify-content: center;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeVar.font.color.primary};
  flex: 1;
  font-family: ${themeVar.font.family};
  font-size: ${themeVar.font.size.md};
  font-weight: ${themeVar.font.weight.regular};
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${themeVar.font.color.light};
    font-weight: ${themeVar.font.weight.medium};
  }

  &:disabled {
    color: ${themeVar.font.color.tertiary};
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
