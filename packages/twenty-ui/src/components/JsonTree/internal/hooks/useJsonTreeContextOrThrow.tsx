import { JsonTreeContext } from '@ui/components/JsonTree/internal/contexts/JsonTreeContext';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { useContext } from 'react';

export const useJsonTreeContextOrThrow = () => {
  const value = useContext(JsonTreeContext);

  if (!isDefined(value)) {
    throw new Error(
      'useJsonTreeContextOrThrow must be used within a JsonTreeContextProvider',
    );
  }

  return value;
};
