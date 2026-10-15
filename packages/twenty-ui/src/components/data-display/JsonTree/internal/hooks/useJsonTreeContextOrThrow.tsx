import { JsonTreeContext } from '@ui/components/data-display/JsonTree/internal/contexts/JsonTreeContext';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { useContext } from 'react';

export const useJsonTreeContextOrThrow = () => {
  const value = useContext(JsonTreeContext);

  if (!isDefined(value)) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is an internal context invariant for developers.
      'useJsonTreeContextOrThrow must be used within a JsonTreeContextProvider',
    );
  }

  return value;
};
