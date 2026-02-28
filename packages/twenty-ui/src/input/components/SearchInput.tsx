import { styled } from '@linaria/react';
import { IconFilter, IconSearch } from '@ui/display';
import { IconButton } from '@ui/input/button/components/IconButton';
import { ThemeContext, type ThemeType } from '@ui/theme';
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

const StyledWrapper = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledInputContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing(2)};

  &:focus-within {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledIconContainer = styled.div<{
  isFocused: boolean;
  theme: ThemeType;
}>`
  align-items: center;
  color: ${({ theme, isFocused }) =>
    isFocused ? theme.font.color.secondary : theme.font.color.light};
  display: flex;
  justify-content: center;
`;

const StyledInput = styled.input<{ theme: ThemeType }>`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
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
    <StyledWrapper theme={theme} className={className}>
      <StyledInputContainer theme={theme}>
        <StyledIconContainer theme={theme} isFocused={isFocused}>
          <IconSearch size={theme.icon.size.md} />
        </StyledIconContainer>
        <StyledInput
          theme={theme}
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
