import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';

import { type FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkspaceMemberAvatarFileDeletionListener } from 'src/modules/workspace-member/listeners/workspace-member-avatar-file-deletion.listener';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const WORKSPACE_ID = 'ec6d123f-0d1c-4b3a-9c1f-2b1a9c8d7e6f';
const OLD_FILE_ID = '11111111-1111-4111-8111-111111111111';
const NEW_FILE_ID = '22222222-2222-4222-8222-222222222222';
const OLD_URL = `http://localhost:3000/file/core-picture/${OLD_FILE_ID}`;
const NEW_URL = `http://localhost:3000/file/core-picture/${NEW_FILE_ID}`;

const buildUpdateBatch = ({
  before,
  after,
  updatedFields,
}: {
  before: Partial<WorkspaceMemberWorkspaceEntity>;
  after: Partial<WorkspaceMemberWorkspaceEntity>;
  updatedFields: string[];
}): WorkspaceEventBatch<
  ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
> =>
  ({
    workspaceId: WORKSPACE_ID,
    events: [
      {
        properties: { before, after, updatedFields, diff: {} },
      },
    ],
  }) as unknown as WorkspaceEventBatch<
    ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
  >;

describe('WorkspaceMemberAvatarFileDeletionListener', () => {
  let listener: WorkspaceMemberAvatarFileDeletionListener;
  let deleteCorePicture: jest.Mock;

  beforeEach(() => {
    deleteCorePicture = jest.fn().mockResolvedValue(undefined);

    listener = new WorkspaceMemberAvatarFileDeletionListener({
      deleteCorePicture,
    } as unknown as FileCorePictureService);
  });

  it('does not delete the avatar file when avatarUrl is unchanged', async () => {
    await listener.handleUpdate(
      buildUpdateBatch({
        before: { avatarUrl: OLD_URL },
        after: {
          name: { firstName: 'Tim', lastName: 'Apple' },
          avatarUrl: OLD_URL,
        },
        updatedFields: ['name'],
      }),
    );

    expect(deleteCorePicture).not.toHaveBeenCalled();
  });

  it('deletes the previous avatar file when the avatar is replaced', async () => {
    await listener.handleUpdate(
      buildUpdateBatch({
        before: { avatarUrl: OLD_URL },
        after: { avatarUrl: NEW_URL },
        updatedFields: ['avatarUrl'],
      }),
    );

    expect(deleteCorePicture).toHaveBeenCalledTimes(1);
    expect(deleteCorePicture).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      fileId: OLD_FILE_ID,
    });
  });

  it('deletes the previous avatar file when the avatar is removed', async () => {
    await listener.handleUpdate(
      buildUpdateBatch({
        before: { avatarUrl: OLD_URL },
        after: { avatarUrl: null },
        updatedFields: ['avatarUrl'],
      }),
    );

    expect(deleteCorePicture).toHaveBeenCalledTimes(1);
    expect(deleteCorePicture).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      fileId: OLD_FILE_ID,
    });
  });
});
