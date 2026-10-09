import { type ComponentPropsWithRef } from 'react';

export type ImageInputFileInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  'children' | 'type' | 'multiple' | 'value' | 'defaultValue' | 'hidden'
>;
