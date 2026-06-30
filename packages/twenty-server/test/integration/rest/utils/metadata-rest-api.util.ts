import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const NON_EXISTENT_UUID = '00000000-0000-4000-8000-000000000000';

export const uniqueSuffix = (): string =>
  Math.random().toString(36).slice(2, 10);

export type CreateTestObjectInput = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  isLabelSyncedWithName: boolean;
};

export const buildUniqueObjectInput = (): CreateTestObjectInput => {
  const suffix = uniqueSuffix();

  return {
    nameSingular: `restTest${suffix}`,
    namePlural: `restTest${suffix}s`,
    labelSingular: `Rest Test ${suffix}`,
    labelPlural: `Rest Tests ${suffix}`,
    icon: 'IconTestPipe',
    isLabelSyncedWithName: false,
  };
};

export const createTestObjectViaGraphql = async (
  overrides?: Partial<CreateTestObjectInput>,
): Promise<{ id: string; input: CreateTestObjectInput }> => {
  const input = { ...buildUniqueObjectInput(), ...overrides };
  const { data, errors } = await createOneObjectMetadata({ input });

  if (!data?.createOneObject?.id) {
    throw new Error(
      `Failed to create test object: ${JSON.stringify(errors ?? data)}`,
    );
  }

  return { id: data.createOneObject.id, input };
};

export const cleanupTestObject = async (id: string): Promise<void> => {
  try {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: { idToUpdate: id, updatePayload: { isActive: false } },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: id },
      expectToFail: false,
    });
  } catch {}
};

export type CreateTestFieldInput = {
  objectMetadataId: string;
  type: FieldMetadataType;
  name: string;
  label: string;
  isLabelSyncedWithName: boolean;
};

export const buildUniqueFieldInput = (
  objectMetadataId: string,
): CreateTestFieldInput => {
  const suffix = uniqueSuffix();

  return {
    objectMetadataId,
    type: FieldMetadataType.TEXT,
    name: `restTestField${suffix}`,
    label: `Rest Test Field ${suffix}`,
    isLabelSyncedWithName: false,
  };
};

export const createTestFieldViaGraphql = async (
  objectMetadataId: string,
  overrides?: Partial<CreateTestFieldInput>,
): Promise<{ id: string; input: CreateTestFieldInput }> => {
  const input = { ...buildUniqueFieldInput(objectMetadataId), ...overrides };
  const { data, errors } = await createOneFieldMetadata({ input });

  if (!data?.createOneField?.id) {
    throw new Error(
      `Failed to create test field: ${JSON.stringify(errors ?? data)}`,
    );
  }

  return { id: data.createOneField.id, input };
};

export const cleanupTestField = async (id: string): Promise<void> => {
  try {
    await deleteOneFieldMetadata({
      input: { idToDelete: id },
      expectToFail: false,
    });
  } catch {
    // best-effort cleanup
  }
};

export type MetadataListPageInfo = {
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export const extractMetadataListPayload = <T>(
  body: Record<string, unknown>,
  pluralKey: 'objects' | 'fields',
): { items: T[]; pageInfo: MetadataListPageInfo; totalCount: number } => {
  if (Array.isArray(body.data)) {
    return {
      items: body.data as T[],
      pageInfo: body.pageInfo as MetadataListPageInfo,
      totalCount: body.totalCount as number,
    };
  }
  const data = body.data as Record<string, unknown>;

  return {
    items: (data[pluralKey] ?? []) as T[],
    pageInfo: body.pageInfo as MetadataListPageInfo,
    totalCount: body.totalCount as number,
  };
};

export const extractMetadataItemPayload = <T>(
  body: Record<string, unknown>,
  legacyKey: string,
): T => {
  const data = body.data as Record<string, unknown> | undefined;

  if (data && legacyKey in data) {
    return data[legacyKey] as T;
  }

  return body as T;
};
