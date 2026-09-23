import { createContext } from 'react';
import { type JsonTreeContextType } from '../types/JsonTreeContextType';

export const JsonTreeContext = createContext<JsonTreeContextType | undefined>(
  undefined,
);
