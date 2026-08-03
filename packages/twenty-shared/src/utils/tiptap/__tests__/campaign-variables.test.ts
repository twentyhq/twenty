import { FieldMetadataType } from '../../../types/FieldMetadataType';
import { listCampaignVariablesForFields } from '../list-campaign-variables-for-fields';

describe('listCampaignVariablesForFields', () => {
  it('should expose scalar fields under their own name', () => {
    expect(
      listCampaignVariablesForFields([
        { name: 'city', label: 'City', type: FieldMetadataType.TEXT },
        { name: 'score', label: 'Score', type: FieldMetadataType.NUMBER },
      ]),
    ).toEqual([
      {
        name: 'city',
        label: 'City',
        fieldName: 'city',
        fieldType: FieldMetadataType.TEXT,
      },
      {
        name: 'score',
        label: 'Score',
        fieldName: 'score',
        fieldType: FieldMetadataType.NUMBER,
      },
    ]);
  });

  it('should expand composites into subfield paths', () => {
    const definitions = listCampaignVariablesForFields([
      { name: 'name', label: 'Name', type: FieldMetadataType.FULL_NAME },
      { name: 'emails', label: 'Emails', type: FieldMetadataType.EMAILS },
      {
        name: 'linkedinLink',
        label: 'LinkedIn',
        type: FieldMetadataType.LINKS,
      },
    ]);

    expect(definitions.map((definition) => definition.name)).toEqual([
      'name.firstName',
      'name.lastName',
      'emails.primaryEmail',
      'linkedinLink.primaryLinkUrl',
    ]);

    // A multi-path composite spells the subfield out; a single-path one
    // keeps the field's own label.
    expect(definitions[0].label).toBe('Name · First name');
    expect(definitions[2].label).toBe('Emails');
    expect(definitions[3].label).toBe('LinkedIn');
  });

  it('should skip system, inactive and unsupported fields', () => {
    expect(
      listCampaignVariablesForFields([
        {
          name: 'searchVector',
          label: 'Search vector',
          type: FieldMetadataType.TEXT,
          isSystem: true,
        },
        {
          name: 'oldField',
          label: 'Old field',
          type: FieldMetadataType.TEXT,
          isActive: false,
        },
        {
          name: 'company',
          label: 'Company',
          type: FieldMetadataType.RELATION,
        },
        {
          name: 'createdBy',
          label: 'Created by',
          type: FieldMetadataType.ACTOR,
        },
      ]),
    ).toEqual([]);
  });
});
