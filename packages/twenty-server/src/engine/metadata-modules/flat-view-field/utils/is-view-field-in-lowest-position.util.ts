import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const isViewFieldInLowestPosition = ({
  flatViewField,
  otherFlatViewFields,
}: {
  otherFlatViewFields: UniversalFlatViewField[];
  flatViewField: UniversalFlatViewField;
}) => {
  if (otherFlatViewFields.length === 0) {
    return true;
  }
  const positions = otherFlatViewFields.map(({ position }) => position);
  const lowestPosition = Math.min(...positions);

  return flatViewField.position < lowestPosition;
};
