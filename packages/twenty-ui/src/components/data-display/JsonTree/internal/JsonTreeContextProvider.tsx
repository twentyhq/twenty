import { JsonTreeContext } from '@ui/components/data-display/JsonTree/internal/contexts/JsonTreeContext';
import { type JsonTreeContextType } from '@ui/components/data-display/JsonTree/internal/types/JsonTreeContextType';

export const JsonTreeContextProvider = ({
  value,
  children,
}: {
  value: JsonTreeContextType;
  children: React.ReactNode;
}) => {
  return (
    <JsonTreeContext.Provider value={value}>
      {children}
    </JsonTreeContext.Provider>
  );
};
