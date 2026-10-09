import { type useRender } from '@base-ui/react/use-render';
import { type ComponentPropsWithRef } from 'react';

export type ImageInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  | 'children'
  | 'dangerouslySetInnerHTML'
  | 'type'
  | 'multiple'
  | 'value'
  | 'defaultValue'
  | 'hidden'
  | 'onAbort'
  | 'src'
  | 'ref'
  | 'className'
  | 'style'
> &
  Pick<
    useRender.ComponentProps<'div'>,
    'ref' | 'render' | 'className' | 'style'
  > & {
    src?: string | null;
    onFileSelect?: (file: File) => void;
    onRemove?: () => void;
    onAbort?: () => void;
    isUploading?: boolean;
    helperText?: string;
    errorMessage?: string | null;
    uploadLabel?: string;
    removeLabel?: string;
    abortLabel?: string;
    inputRef?: ComponentPropsWithRef<'input'>['ref'];
  };
