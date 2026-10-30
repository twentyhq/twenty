import { getAvatarInitial } from '../getAvatarInitial';

describe('getAvatarInitial', () => {
  it('keeps the same initial while the name is being typed', () => {
    expect(getAvatarInitial('w')).toBe('W');
    expect(getAvatarInitial('worksp')).toBe('W');
    expect(getAvatarInitial(' Workspace')).toBe('W');
  });

  it('returns an empty initial when there is no name', () => {
    expect(getAvatarInitial('')).toBe('');
    expect(getAvatarInitial(null)).toBe('');
    expect(getAvatarInitial(undefined)).toBe('');
  });
});
