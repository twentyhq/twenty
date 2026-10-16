import { isValidElement, type ReactElement } from 'react';

export const getDropdownItemExplicitId = ({
  id,
  render,
}: {
  id?: string;
  render?: ReactElement;
}) => {
  if (!isValidElement<{ id?: string }>(render)) {
    return id;
  }

  return render.props.id ?? id;
};
