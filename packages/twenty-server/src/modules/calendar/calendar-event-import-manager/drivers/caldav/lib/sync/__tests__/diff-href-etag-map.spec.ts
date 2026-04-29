import { diffHrefEtagMap } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/sync/diff-href-etag-map';

describe('diffHrefEtagMap', () => {
  it('returns no work when stored and current are identical', () => {
    const stored = { '/cal/1.ics': '"a"', '/cal/2.ics': '"b"' };
    const current = { '/cal/1.ics': '"a"', '/cal/2.ics': '"b"' };

    expect(diffHrefEtagMap(stored, current)).toEqual({
      changedHrefs: [],
      cancelledHrefs: [],
    });
  });

  it('flags every href on first sync when nothing is stored yet', () => {
    const stored = {};
    const current = { '/cal/1.ics': '"a"', '/cal/2.ics': '"b"' };

    const { changedHrefs, cancelledHrefs } = diffHrefEtagMap(stored, current);

    expect(changedHrefs.sort()).toEqual(['/cal/1.ics', '/cal/2.ics']);
    expect(cancelledHrefs).toEqual([]);
  });

  it('flags hrefs whose etag changed server-side', () => {
    const stored = { '/cal/1.ics': '"a"', '/cal/2.ics': '"b"' };
    const current = { '/cal/1.ics': '"a"', '/cal/2.ics': '"b-updated"' };

    expect(diffHrefEtagMap(stored, current)).toEqual({
      changedHrefs: ['/cal/2.ics'],
      cancelledHrefs: [],
    });
  });

  it('flags hrefs that disappeared from the server as cancelled', () => {
    const stored = { '/cal/1.ics': '"a"', '/cal/2.ics': '"b"' };
    const current = { '/cal/1.ics': '"a"' };

    expect(diffHrefEtagMap(stored, current)).toEqual({
      changedHrefs: [],
      cancelledHrefs: ['/cal/2.ics'],
    });
  });
});
