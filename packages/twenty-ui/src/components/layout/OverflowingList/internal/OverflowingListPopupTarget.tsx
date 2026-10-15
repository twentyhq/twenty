import { mergeProps } from '@base-ui/react/merge-props';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { isFunction } from '@sniptt/guards';
import { cloneElement, isValidElement, type ReactElement } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type OverflowingListProps } from '../types/OverflowingListProps';

type PopupRender = Exclude<
  NonNullable<NonNullable<OverflowingListProps['popupProps']>['render']>,
  ReactElement
>;

type OverflowingListPopupTargetProps = {
  props: Parameters<PopupRender>[0];
  state: Parameters<PopupRender>[1];
  render: NonNullable<OverflowingListProps['popupProps']>['render'];
};

export const OverflowingListPopupTarget = ({
  props,
  state,
  render,
}: OverflowingListPopupTargetProps) => {
  const renderElement = isValidElement<Parameters<PopupRender>[0]>(render)
    ? render
    : undefined;
  const mergedRef = useMergedRefs(props.ref, renderElement?.props.ref);

  if (isFunction(render)) {
    return render(props, state);
  }

  const mergedProps = {
    ...mergeProps<'div'>(props, renderElement?.props),
    children: props.children,
    ref: mergedRef,
  };

  return isDefined(renderElement) ? (
    cloneElement(renderElement, mergedProps)
  ) : (
    <div {...mergedProps} />
  );
};
