import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export const isViewFieldInLowestPosition = ({
  flatViewField,
  otherFlatViewFields,
}: {
  otherFlatViewFields: FlatViewField[];
  flatViewField: FlatViewField;
}) => {
  if (otherFlatViewFields.length === 0) {
    return true;
  }
  const positions = otherFlatViewFields.map(({ position }) => position);
  const lowestPosition = Math.min(...positions);

  return flatViewField.position < lowestPosition;
};
