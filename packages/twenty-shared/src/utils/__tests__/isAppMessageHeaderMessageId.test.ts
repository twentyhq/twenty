import { isAppMessageHeaderMessageId } from '../isAppMessageHeaderMessageId';

describe('isAppMessageHeaderMessageId', () => {
  it('should detect messages ingested by an app', () => {
    expect(
      isAppMessageHeaderMessageId(
        'app:2d1e6a6e-7c3f-4a8e-9a3f-7d0a4b5e9c11:5c2b1a3d-8e7f-4c6d-9b0a-1f2e3d4c5b6a:msg-1',
      ),
    ).toBe(true);
  });

  it('should not flag email messages', () => {
    expect(isAppMessageHeaderMessageId('<CAF=abc@mail.gmail.com>')).toBe(false);
    expect(isAppMessageHeaderMessageId(null)).toBe(false);
  });
});
