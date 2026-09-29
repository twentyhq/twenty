import { useContext } from 'react';

import { TextDirectionContext } from './TextDirectionContext';

export const useProvidedTextDirection = () => useContext(TextDirectionContext);
