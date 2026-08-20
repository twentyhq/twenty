import { FieldMetadataType } from 'twenty-shared/types';

import { serializeJsonbWriteValue } from 'src/engine/twenty-orm-v2/sql/utils/serialize-jsonb-write-value.util';
import { type WorkspaceColumnShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const columnShape = (
  fieldMetadataType: FieldMetadataType,
): WorkspaceColumnShape => ({
  columnName: 'someColumn',
  fieldMetadataId: 'field-id',
  fieldName: 'someField',
  fieldMetadataType,
});

describe('serializeJsonbWriteValue', () => {
  it('stringifies an array value for a RAW_JSON column', () => {
    const value = [{ url: 'https://twenty.com', label: 'Twenty' }];

    expect(
      serializeJsonbWriteValue(columnShape(FieldMetadataType.RAW_JSON), value),
    ).toBe('[{"url":"https://twenty.com","label":"Twenty"}]');
  });

  it('stringifies an array value for a FILES column', () => {
    const value = [{ fileId: 'file-1', label: 'doc.pdf' }];

    expect(
      serializeJsonbWriteValue(columnShape(FieldMetadataType.FILES), value),
    ).toBe('[{"fileId":"file-1","label":"doc.pdf"}]');
  });

  it('stringifies an object value for a jsonb column', () => {
    expect(
      serializeJsonbWriteValue(columnShape(FieldMetadataType.RAW_JSON), {
        a: 1,
      }),
    ).toBe('{"a":1}');
  });

  it('passes null through for a jsonb column so it binds SQL NULL', () => {
    expect(
      serializeJsonbWriteValue(columnShape(FieldMetadataType.RAW_JSON), null),
    ).toBeNull();
  });

  it('leaves a non-jsonb text value untouched', () => {
    expect(
      serializeJsonbWriteValue(columnShape(FieldMetadataType.TEXT), 'hello'),
    ).toBe('hello');
  });

  it('leaves a MULTI_SELECT array untouched so pg renders a Postgres array literal', () => {
    const value = ['A', 'B'];

    expect(
      serializeJsonbWriteValue(
        columnShape(FieldMetadataType.MULTI_SELECT),
        value,
      ),
    ).toBe(value);
  });

  it('returns the value unchanged when the column shape is unknown', () => {
    const value = [1, 2, 3];

    expect(serializeJsonbWriteValue(undefined, value)).toBe(value);
  });
});
