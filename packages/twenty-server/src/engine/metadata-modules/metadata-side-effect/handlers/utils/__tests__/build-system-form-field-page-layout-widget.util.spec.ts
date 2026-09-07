import {
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode, WidgetType } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

import { buildSystemFormFieldPageLayoutWidget } from '../build-system-form-field-page-layout-widget.util';

const applicationUniversalIdentifier = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const fieldUniversalIdentifier = 'c1c2c3c4-c5c6-4000-8000-000000000001';

const derivedPageLayoutTabUniversalIdentifier =
  getSystemPageLayoutTabUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    pageLayoutUniversalIdentifier:
      getSystemRecordFormPageLayoutUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    title: 'Fields',
  });

describe('buildSystemFormFieldPageLayoutWidget', () => {
  const buildWidget = (index: number) =>
    buildSystemFormFieldPageLayoutWidget({
      applicationUniversalIdentifier,
      pageLayoutTabUniversalIdentifier: derivedPageLayoutTabUniversalIdentifier,
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      flatFieldMetadata: {
        universalIdentifier: fieldUniversalIdentifier,
      },
      index,
    });

  it('should build a system-owned FORM_FIELD widget pointing at the field', () => {
    const widget = buildWidget(0);

    expect(widget.universalIdentifier).toBe(
      getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        pageLayoutTabUniversalIdentifier:
          derivedPageLayoutTabUniversalIdentifier,
        fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
      }),
    );
    expect(widget.type).toBe(WidgetType.FORM_FIELD);
    expect(widget.title).toBe('');
    expect(widget.universalConfiguration).toEqual({
      configurationType: WidgetConfigurationType.FORM_FIELD,
      fieldMetadataId: fieldUniversalIdentifier,
    });
    expect(widget.isActive).toBe(true);
    expect(widget.isSystemSideEffect).toBe(true);
  });

  it('should place the widget at the given vertical list index', () => {
    expect(buildWidget(3).position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 3,
    });
  });

  it('should keep the same identifier whatever the position', () => {
    expect(buildWidget(0).universalIdentifier).toBe(
      buildWidget(7).universalIdentifier,
    );
  });
});
