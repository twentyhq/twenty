import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { collectReferencedSkillIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/collect-referenced-skill-ids.util';

const SKILL_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const OTHER_SKILL_ID = '11111111-2222-3333-4444-555555555555';

const userMessage = (text: string): ExtendedUIMessage =>
  ({
    id: text,
    role: 'user',
    parts: [{ type: 'text', text }],
  }) as ExtendedUIMessage;

describe('collectReferencedSkillIds', () => {
  it('should return the ids of skills referenced in user messages', () => {
    expect(
      collectReferencedSkillIds([
        userMessage(`Use [[skill:${SKILL_ID}:Workflow building]] here`),
      ]),
    ).toEqual([SKILL_ID]);
  });

  it('should deduplicate ids across messages and keep first-seen order', () => {
    expect(
      collectReferencedSkillIds([
        userMessage(
          `[[skill:${SKILL_ID}:A]] and [[skill:${OTHER_SKILL_ID}:B]]`,
        ),
        userMessage(`Again [[skill:${SKILL_ID}:A]]`),
      ]),
    ).toEqual([SKILL_ID, OTHER_SKILL_ID]);
  });

  it('should match a reference whose label contains brackets', () => {
    expect(
      collectReferencedSkillIds([
        userMessage(`Use [[skill:${SKILL_ID}:Research [beta]]] now`),
      ]),
    ).toEqual([SKILL_ID]);
  });

  it('should ignore assistant messages and other reference kinds', () => {
    expect(
      collectReferencedSkillIds([
        {
          id: 'assistant',
          role: 'assistant',
          parts: [{ type: 'text', text: `[[skill:${SKILL_ID}:A]]` }],
        } as ExtendedUIMessage,
        userMessage(
          `[[record:company:${SKILL_ID}:Acme]] [[skill:not-a-uuid:A]]`,
        ),
      ]),
    ).toEqual([]);
  });
});
