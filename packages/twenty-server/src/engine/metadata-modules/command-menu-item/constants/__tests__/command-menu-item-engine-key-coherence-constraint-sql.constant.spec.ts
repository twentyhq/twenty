import { COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL } from 'src/engine/metadata-modules/command-menu-item/constants/command-menu-item-engine-key-coherence-constraint-sql.constant';

describe('COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL', () => {
  it('constrains CREATE_NEW_RECORD payloads to null or object metadata payloads', () => {
    expect(COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL).toContain(
      `"engineComponentKey" = 'CREATE_NEW_RECORD'`,
    );
    expect(COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL).toContain(
      `"payload" IS NULL OR`,
    );
    expect(COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL).toContain(
      `"payload" ? 'objectMetadataItemId'`,
    );
    expect(COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL).toContain(
      `"payload" ->> 'objectMetadataItemId' <> ''`,
    );
    expect(COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL).toContain(
      `NOT ("payload" ? 'path')`,
    );
  });
});
