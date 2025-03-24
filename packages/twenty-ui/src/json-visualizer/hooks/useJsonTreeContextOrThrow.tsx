import { JsonTreeContext } from '@ui/json-visualizer/contexts/JsonTreeContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useJsonTreeContextOrThrow = () => {
  const value = useContext(JsonTreeContext);

  if (!isDefined(value)) {
    throw new Error(
      'useJsonTreeContextOrThrow must be used within a JsonTreeContextProvider',
    );
  }

  return value;
};
