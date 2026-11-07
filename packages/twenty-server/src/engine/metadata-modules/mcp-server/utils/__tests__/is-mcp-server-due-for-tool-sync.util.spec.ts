import { isMcpServerDueForToolSync } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-server-due-for-tool-sync.util';

const NOW = new Date('2026-11-05T12:00:00Z');

describe('isMcpServerDueForToolSync', () => {
  it('leaves a server alone once its tools were synced', () => {
    expect(
      isMcpServerDueForToolSync({
        mcpServer: {
          toolsSyncedAt: '2026-11-01T00:00:00Z',
          toolsSyncError: 'timeout',
          updatedAt: '2026-11-01T00:00:00Z',
        },
        now: NOW,
      }),
    ).toBe(false);
  });

  it('syncs a server that was never tried', () => {
    expect(
      isMcpServerDueForToolSync({
        mcpServer: {
          toolsSyncedAt: null,
          toolsSyncError: null,
          updatedAt: NOW.toISOString(),
        },
        now: NOW,
      }),
    ).toBe(true);
  });

  it('waits five minutes before retrying a failed sync', () => {
    const buildFailedMcpServer = (updatedAt: string) => ({
      toolsSyncedAt: null,
      toolsSyncError: 'No connected account',
      updatedAt,
    });

    expect(
      isMcpServerDueForToolSync({
        mcpServer: buildFailedMcpServer('2026-11-05T11:56:00Z'),
        now: NOW,
      }),
    ).toBe(false);
    expect(
      isMcpServerDueForToolSync({
        mcpServer: buildFailedMcpServer('2026-11-05T11:54:00Z'),
        now: NOW,
      }),
    ).toBe(true);
  });
});
