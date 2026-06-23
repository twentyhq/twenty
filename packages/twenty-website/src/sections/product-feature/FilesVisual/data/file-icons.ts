import {
  IconFileText,
  IconPhoto,
  IconPresentation,
  IconTable,
} from '@tabler/icons-react';
import { type ComponentType } from 'react';

import { type FileCategory } from '../types/file-category';

type FileGlyph = ComponentType<{ size?: number; stroke?: number }>;

export const FILE_ICONS: Record<FileCategory, FileGlyph> = {
  document: IconFileText,
  image: IconPhoto,
  presentation: IconPresentation,
  spreadsheet: IconTable,
};
