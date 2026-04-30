import { formatUpgradeCommandName } from '../formatUpgradeCommandName';

describe('formatUpgradeCommandName', () => {
  it('should append (instance fast) for fast instance commands', () => {
    expect(
      formatUpgradeCommandName(
        '1.23.0_DropWorkspaceVersionColumnFastInstanceCommand_1785000000000',
      ),
    ).toBe('DropWorkspaceVersionColumn 1785000000000 (1.23.0) (instance fast)');
  });

  it('should append (instance slow) for slow instance commands', () => {
    expect(
      formatUpgradeCommandName(
        '1.23.0_BackfillWorkspaceIdSlowInstanceCommand_1785000000001',
      ),
    ).toBe('BackfillWorkspaceId 1785000000001 (1.23.0) (instance slow)');
  });

  it('should append (workspace) for workspace commands', () => {
    expect(
      formatUpgradeCommandName(
        '1.22.0_BackfillStandardSkillsCommand_1780000002000',
      ),
    ).toBe('BackfillStandardSkills 1780000002000 (1.22.0) (workspace)');
  });

  it('should return raw name when fewer than three segments', () => {
    expect(formatUpgradeCommandName('short')).toBe('short');
    expect(formatUpgradeCommandName('a_b')).toBe('a_b');
  });
});
