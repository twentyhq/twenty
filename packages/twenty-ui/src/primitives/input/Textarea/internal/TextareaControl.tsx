import { type Input as InputPrimitive } from '@base-ui/react/input';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type ComponentPropsWithRef } from 'react';

import { type TextareaProps } from '../types/TextareaProps';

type TextareaControlProps = {
  controlProps: ComponentPropsWithRef<'textarea'>;
  nativeProps: ComponentPropsWithRef<'textarea'>;
  state: InputPrimitive.State;
  render: TextareaProps['render'];
};

export const TextareaControl = ({
  controlProps,
  nativeProps,
  state,
  render,
}: TextareaControlProps) => {
  const { ref: controlRef, ...controlElementProps } = controlProps;
  const { ref: nativeRef, ...nativeElementProps } = nativeProps;

  return useRender({
    defaultTagName: 'textarea',
    render,
    state: { ...state },
    ref: [controlRef ?? null, nativeRef ?? null],
    props: mergeProps(controlElementProps, nativeElementProps),
  });
};
