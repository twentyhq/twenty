import { isReservedFrontComponentSettingsTabLabel } from '@/application/utils/isReservedFrontComponentSettingsTabLabel';

describe('isReservedFrontComponentSettingsTabLabel', () => {
  it('should reserve the General label', () => {
    expect(isReservedFrontComponentSettingsTabLabel('General')).toBe(true);
  });

  it('should ignore casing and surrounding whitespace', () => {
    expect(isReservedFrontComponentSettingsTabLabel('general')).toBe(true);
    expect(isReservedFrontComponentSettingsTabLabel('GENERAL')).toBe(true);
    expect(isReservedFrontComponentSettingsTabLabel('  General  ')).toBe(true);
  });

  it('should allow a label that merely contains the reserved word', () => {
    expect(isReservedFrontComponentSettingsTabLabel('General settings')).toBe(
      false,
    );
    expect(isReservedFrontComponentSettingsTabLabel('Sync')).toBe(false);
  });
});
