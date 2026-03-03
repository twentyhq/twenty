import { themeCssVariables } from '../../theme-constants';

export const TEXT_INPUT_STYLE = `
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;
