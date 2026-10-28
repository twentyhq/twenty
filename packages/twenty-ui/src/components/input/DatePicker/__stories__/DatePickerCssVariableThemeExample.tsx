import { THEME_LIGHT } from '@ui/theme/constants/ThemeLight';
import { getThemeContext } from '@ui/theme/internal/getThemeContext';
import { themeCssVariables } from '@ui/theme/themeCssVariables';

import { DatePickerExample } from './DatePickerExample';

export const DatePickerCssVariableThemeExample = () => {
  const ThemeContext = getThemeContext();

  return (
    <ThemeContext.Provider
      value={{
        theme: { ...THEME_LIGHT, spacing: themeCssVariables.spacing },
        colorScheme: 'light',
      }}
    >
      <DatePickerExample />
    </ThemeContext.Provider>
  );
};
