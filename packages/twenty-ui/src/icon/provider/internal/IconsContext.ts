import { createContext } from 'react';

import { type IconComponent } from '@ui/icon/types/IconComponent';

export const IconsContext = createContext<Record<string, IconComponent>>({});
