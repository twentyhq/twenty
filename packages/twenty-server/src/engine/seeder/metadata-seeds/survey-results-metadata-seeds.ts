import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { NumberDataType } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { ObjectMetadataSeed } from 'src/engine/seeder/interfaces/object-metadata-seed';
import { FieldMetadataType } from 'twenty-shared/types';

export const SURVEY_RESULTS_METADATA_SEEDS: ObjectMetadataSeed = {
  labelPlural: 'Survey results',
  labelSingular: 'Survey result',
  namePlural: 'surveyResults',
  nameSingular: 'surveyResult',
  icon: 'IconRulerMeasure',
  fields: [
    {
      type: FieldMetadataType.NUMBER,
      label: 'Score (Float 3 decimals)',
      name: 'score',
      settings: {
        dataType: NumberDataType.FLOAT,
        decimals: 3,
        type: 'number',
      },
    } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
    {
      type: FieldMetadataType.NUMBER,
      label: 'Percentage of completion (Float 3 decimals + percentage)',
      name: 'percentageOfCompletion',
      settings: {
        dataType: NumberDataType.FLOAT,
        decimals: 6,
        type: 'percentage',
      },
    } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
    {
      type: FieldMetadataType.NUMBER,
      label: 'Participants (Int)',
      name: 'participants',
      settings: {
        dataType: NumberDataType.INT,
        type: 'number',
      },
    } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
    {
      type: FieldMetadataType.NUMBER,
      label: 'Average estimated number of atoms in the universe (BigInt)',
      name: 'averageEstimatedNumberOfAtomsInTheUniverse',
      settings: {
        dataType: NumberDataType.BIGINT,
        type: 'number',
      },
    } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
    {
      type: FieldMetadataType.TEXT,
      label: 'Comments (Max 5 rows)',
      name: 'comments',
      settings: {
        displayedMaxRows: 5,
      },
    } as FieldMetadataDTO<FieldMetadataType.TEXT>,
    {
      type: FieldMetadataType.TEXT,
      label: 'Short notes (Max 1 row)',
      name: 'shortNotes',
      settings: {
        displayedMaxRows: 1,
      },
    } as FieldMetadataDTO<FieldMetadataType.TEXT>,
  ],
};
