import { computeChannelIdsByVisibilityLevel } from 'src/engine/permissions/channel-visibility/utils/compute-channel-ids-by-visibility-level.util';

describe('computeChannelIdsByVisibilityLevel', () => {
  const channels = [
    {
      id: 'c1',
      ownerUserWorkspaceId: 'jane',
      sharedLevel: 'metadata' as const,
    },
    { id: 'c2', ownerUserWorkspaceId: 'bob', sharedLevel: 'subject' as const },
    { id: 'c3', ownerUserWorkspaceId: 'bob', sharedLevel: 'metadata' as const },
    { id: 'c4', ownerUserWorkspaceId: 'bob', sharedLevel: 'full' as const },
  ];

  it('should give the owner everything on a channel, whatever it shares', () => {
    expect(
      computeChannelIdsByVisibilityLevel({ channels, userWorkspaceId: 'jane' }),
    ).toEqual({ full: ['c1', 'c4'], subject: ['c2'], metadata: ['c3'] });
  });

  it('should give another member what each channel shares', () => {
    expect(
      computeChannelIdsByVisibilityLevel({ channels, userWorkspaceId: 'bob' }),
    ).toEqual({ full: ['c2', 'c3', 'c4'], subject: [], metadata: ['c1'] });
  });

  it('should put every channel in exactly one level', () => {
    const { full, subject, metadata } = computeChannelIdsByVisibilityLevel({
      channels,
      userWorkspaceId: 'someone-else',
    });

    expect([...full, ...subject, ...metadata].sort()).toEqual([
      'c1',
      'c2',
      'c3',
      'c4',
    ]);
  });
});
