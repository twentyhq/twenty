import { type useRender } from '@base-ui/react/use-render';

import { type ImageInputFileInputProps } from './ImageInputFileInputProps';

export type ImageInputProps = Omit<
  useRender.ComponentProps<'div'>,
  'children' | 'onAbort'
> & {
  src?: string | null;
  onFileSelect?: (file: File) => void;
  onRemove?: () => void;
  onAbort?: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  helperText?: string;
  errorMessage?: string | null;
  uploadLabel?: string;
  removeLabel?: string;
  abortLabel?: string;
  fileInputProps?: ImageInputFileInputProps;
};
