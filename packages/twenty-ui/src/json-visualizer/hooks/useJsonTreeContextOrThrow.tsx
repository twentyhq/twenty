import { JsonTreeContext } from '@ui/json-visualizer/contexts/JsonTreeContext';
import { useContext } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

export const useJsonTreeContextOrThrow = () => {
  const value = useContext(JsonTreeContext);

  if (!isDefined(value)) {
    throw new Error(
      'useJsonTreeContextOrThrow must be used within a JsonTreeContextProvider',
    );
  }

  return value;
};
