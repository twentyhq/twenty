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

  it('should keep every entry without an unresolved set', () => {
    expect(
      buildFormattedToRawLookupDto({
        axisLookups: [
          { formattedToRawLookup: lookup, relationLabelResolution: undefined },
        ],
      }),
    ).toEqual({
      Alice: 'agent-id-1',
      Unknown: 'agent-id-2',
    });
  });

  it('should strip entries whose raw value is unresolved on their own axis', () => {
    expect(
      buildFormattedToRawLookupDto({
        axisLookups: [
          {
            formattedToRawLookup: lookup,
            relationLabelResolution: buildResolution(new Set(['agent-id-2'])),
          },
        ],
      }),
    ).toEqual({
      Alice: 'agent-id-1',
    });
  });

  it('should not strip an entry matching another axis unresolved record id', () => {
    expect(
      buildFormattedToRawLookupDto({
        axisLookups: [
          {
            formattedToRawLookup: new Map<string, RawDimensionValue>([
              ['2024-01-01', 'agent-id-1'],
            ]),
            relationLabelResolution: undefined,
          },
          {
            formattedToRawLookup: lookup,
            relationLabelResolution: buildResolution(new Set(['agent-id-2'])),
          },
        ],
      }),
    ).toEqual({
      '2024-01-01': 'agent-id-1',
      Alice: 'agent-id-1',
    });
  });

  it('should keep an entry whose formatted value is __proto__', () => {
    const result = buildFormattedToRawLookupDto({
      axisLookups: [
        {
          formattedToRawLookup: new Map<string, RawDimensionValue>([
            ['__proto__', 'agent-id-1'],
          ]),
          relationLabelResolution: undefined,
        },
      ],
    });

    expect(Object.entries(result)).toEqual([['__proto__', 'agent-id-1']]);
  });

  it('should let later axis entries win formatted key collisions', () => {
    expect(
      buildFormattedToRawLookupDto({
        axisLookups: [
          {
            formattedToRawLookup: new Map<string, RawDimensionValue>([
              ['Alice', 'secondary-id'],
            ]),
            relationLabelResolution: undefined,
          },
          {
            formattedToRawLookup: lookup,
            relationLabelResolution: buildResolution(new Set(['agent-id-2'])),
          },
        ],
      }),
    ).toEqual({
      Alice: 'agent-id-1',
    });
  });
});
