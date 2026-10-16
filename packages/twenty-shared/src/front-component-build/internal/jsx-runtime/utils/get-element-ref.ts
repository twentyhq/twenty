import { type ClonedElement } from '@/front-component-build/internal/jsx-runtime/types/ClonedElement';

export const getElementRef = (
  element: ClonedElement,
  readsElementRefFromVnode: boolean,
) => {
  if (readsElementRefFromVnode) {
    return element.ref;
  }

  return element.props.ref;
};
