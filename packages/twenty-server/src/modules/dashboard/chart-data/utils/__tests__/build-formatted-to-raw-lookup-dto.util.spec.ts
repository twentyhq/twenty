import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { buildFormattedToRawLookupDto } from 'src/modules/dashboard/chart-data/utils/build-formatted-to-raw-lookup-dto.util';

const buildResolution = (
  unresolvedRecordIds: Set<string>,
): RelationLabelResolution => ({
  labelByRecordId: new Map<string, string>(),
  unresolvedRecordIds,
});

describe('buildFormattedToRawLookupDto', () => {
  const lookup = new Map<string, RawDimensionValue>([
    ['Alice', 'agent-id-1'],
    ['Unknown', 'agent-id-2'],
  ]);

  it('should keep every entry without unresolved sets', () => {
    expect(
      buildFormattedToRawLookupDto({
        formattedToRawLookup: lookup,
        relationLabelResolutions: [undefined],
      }),
    ).toEqual({
      Alice: 'agent-id-1',
      Unknown: 'agent-id-2',
    });
  });

  it('should strip entries whose raw value is unresolved', () => {
    expect(
      buildFormattedToRawLookupDto({
        formattedToRawLookup: lookup,
        relationLabelResolutions: [buildResolution(new Set(['agent-id-2']))],
      }),
    ).toEqual({
      Alice: 'agent-id-1',
    });
  });

  it('should apply every provided unresolved set', () => {
    expect(
      buildFormattedToRawLookupDto({
        formattedToRawLookup: lookup,
        relationLabelResolutions: [
          buildResolution(new Set(['agent-id-1'])),
          buildResolution(new Set(['agent-id-2'])),
        ],
      }),
    ).toEqual({});
  });
});
