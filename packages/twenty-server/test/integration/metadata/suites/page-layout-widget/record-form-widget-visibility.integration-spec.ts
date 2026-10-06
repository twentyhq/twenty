import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { FieldMetadataType, PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const FORM_FIELD_WIDGET_GQL_FIELDS = `
  id
  isActive
  position {
    ... on PageLayoutWidgetVerticalListPosition {
      layoutMode
      index
    }
  }
  configuration {
    ... on FormFieldConfiguration {
      configurationType
      fieldMetadataId
    }
  }
`;

type FormFieldWidget = {
  id: string;
  isActive: boolean;
  position: { layoutMode: string; index: number } | null;
  configuration: { fieldMetadataId: string };
};

describe('Record form widget visibility', () => {
  let objectMetadataId: string;
  let fieldMetadataId: string;
  let recordFormTabId: string;

  const findFormFieldWidget = async (
    targetFieldMetadataId: string,
  ): Promise<FormFieldWidget | undefined> => {
    const { data } = await findPageLayoutWidgets({
      expectToFail: false,
      input: { pageLayoutTabId: recordFormTabId },
      gqlFields: FORM_FIELD_WIDGET_GQL_FIELDS,
    });

    return (data.getPageLayoutWidgets as unknown as FormFieldWidget[]).find(
      (widget) =>
        widget.configuration?.fieldMetadataId === targetFieldMetadataId,
    );
  };

  const findFormFieldWidgetOrThrow = async (
    targetFieldMetadataId: string,
  ): Promise<FormFieldWidget> => {
    const widget = await findFormFieldWidget(targetFieldMetadataId);

    if (!isDefined(widget)) {
      throw new Error(
        `No form field widget found for field ${targetFieldMetadataId}`,
      );
    }

    return widget;
  };

  const setWidgetIsActive = async (widgetId: string, isActive: boolean) => {
    const { data } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: { id: widgetId, isActive },
      gqlFields: FORM_FIELD_WIDGET_GQL_FIELDS,
    });

    return data.updatePageLayoutWidget as unknown as FormFieldWidget;
  };

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: createdObjectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'recordFormVisibilityTestObject',
        namePlural: 'recordFormVisibilityTestObjects',
        labelSingular: 'Record Form Visibility Test Object',
        labelPlural: 'Record Form Visibility Test Objects',
        icon: 'IconForms',
      },
    });

    objectMetadataId = createdObjectMetadataId;

    const {
      data: {
        createOneField: { id: createdFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'nickname',
        type: FieldMetadataType.TEXT,
        label: 'Nickname',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    fieldMetadataId = createdFieldMetadataId;

    const { data: pageLayoutsData } = await findPageLayouts({
      expectToFail: false,
      input: { objectMetadataId },
      gqlFields: `
        id
        type
      `,
    });

    const recordFormPageLayout = pageLayoutsData.getPageLayouts.find(
      (pageLayout) => pageLayout.type === PageLayoutType.RECORD_FORM,
    );

    expect(recordFormPageLayout).toBeDefined();

    const { data: tabsData } = await findPageLayoutTabs({
      expectToFail: false,
      input: { pageLayoutId: recordFormPageLayout!.id },
      gqlFields: 'id',
    });

    recordFormTabId = tabsData.getPageLayoutTabs[0].id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('provisions newly eligible fields as visible', async () => {
    const widget = await findFormFieldWidgetOrThrow(fieldMetadataId);

    expect(widget.isActive).toBe(true);
  });

  it('hides a form field widget without moving it', async () => {
    const widgetBeforeHiding =
      await findFormFieldWidgetOrThrow(fieldMetadataId);

    const updatedWidget = await setWidgetIsActive(widgetBeforeHiding.id, false);

    expect(updatedWidget.isActive).toBe(false);

    const widgetAfterHiding = await findFormFieldWidgetOrThrow(fieldMetadataId);

    expect(widgetAfterHiding.isActive).toBe(false);
    expect(widgetAfterHiding.position).toEqual(widgetBeforeHiding.position);
  });

  it('keeps the field hidden when it is renamed', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { name: 'alias', label: 'Alias' },
      },
      gqlFields: 'id',
    });

    const widget = await findFormFieldWidgetOrThrow(fieldMetadataId);

    expect(widget.isActive).toBe(false);
  });

  it('keeps the field hidden across unrelated metadata changes', async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: {
          labelSingular: 'Record Form Visibility Renamed Object',
        },
      },
    });

    const {
      data: {
        createOneField: { id: otherFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'favoriteColor',
        type: FieldMetadataType.TEXT,
        label: 'Favorite color',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const hiddenWidget = await findFormFieldWidgetOrThrow(fieldMetadataId);
    const newWidget = await findFormFieldWidgetOrThrow(otherFieldMetadataId);

    expect(hiddenWidget.isActive).toBe(false);
    expect(newWidget.isActive).toBe(true);
  });

  it('refuses the change for a member without the layouts permission', async () => {
    const widget = await findFormFieldWidgetOrThrow(fieldMetadataId);

    const { errors } = await updateOnePageLayoutWidget({
      expectToFail: true,
      input: { id: widget.id, isActive: true },
      gqlFields: FORM_FIELD_WIDGET_GQL_FIELDS,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeDefined();

    const widgetAfterRefusal =
      await findFormFieldWidgetOrThrow(fieldMetadataId);

    expect(widgetAfterRefusal.isActive).toBe(false);
  });

  it('shows the field again', async () => {
    const widget = await findFormFieldWidgetOrThrow(fieldMetadataId);

    const updatedWidget = await setWidgetIsActive(widget.id, true);

    expect(updatedWidget.isActive).toBe(true);
  });

  it('forgets the hidden state when the field is deactivated and reactivated', async () => {
    const widget = await findFormFieldWidgetOrThrow(fieldMetadataId);

    await setWidgetIsActive(widget.id, false);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id',
    });

    expect(await findFormFieldWidget(fieldMetadataId)).toBeUndefined();

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { isActive: true },
      },
      gqlFields: 'id',
    });

    const reprovisionedWidget =
      await findFormFieldWidgetOrThrow(fieldMetadataId);

    expect(reprovisionedWidget.isActive).toBe(true);
  });
});
