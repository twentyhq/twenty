import {
  JsonTreeContext,
  type JsonTreeContextType,
} from '@ui/json-visualizer/contexts/JsonTreeContext';

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
