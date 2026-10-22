import { isValidElement } from 'react';

import { type DropdownOptionItemProps } from '../types/DropdownOptionItemProps';

export const getDropdownItemExplicitId = ({
  id,
  render,
}: {
  id?: string;
  render?: DropdownOptionItemProps['render'];
}) => {
  if (!isValidElement<{ id?: string }>(render)) {
    return id;
  }

  return render.props.id ?? id;
};
