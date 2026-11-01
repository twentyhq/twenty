import { JsonTreeContext } from '@ui/components/data-display/JsonTree/internal/contexts/JsonTreeContext';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { useContext } from 'react';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const useJsonTreeContextOrThrow = () => {
  const value = useContext(JsonTreeContext);

  if (!isDefined(value)) {
    throw new Error(
      doNotTranslate(
        'useJsonTreeContextOrThrow must be used within a JsonTreeContextProvider',
      ),
    );
  }

  return value;
};
