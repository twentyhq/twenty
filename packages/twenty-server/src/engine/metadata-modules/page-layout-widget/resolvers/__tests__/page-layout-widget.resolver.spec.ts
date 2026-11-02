import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { PageLayoutWidgetResolver } from 'src/engine/metadata-modules/page-layout-widget/resolvers/page-layout-widget.resolver';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const APPLICATION_ID = 'c832302c-e551-4b4f-b11c-19907888a284';
const OTHER_APPLICATION_ID = 'd6102749-b118-45b0-bac1-22cad3d4eb7f';
const ORIGIN = 'https://phone.example.com';
const MICROPHONE_PERMISSION = {
  origin: ORIGIN,
  microphone: true,
  camera: false,
};
const CAMERA_PERMISSION = {
  origin: ORIGIN,
  microphone: false,
  camera: true,
};

describe('PageLayoutWidgetResolver application media permissions', () => {
  let moduleRef: TestingModule;
  let resolver: PageLayoutWidgetResolver;
  const workspaceCacheService = { getOrRecompute: jest.fn() };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        PageLayoutWidgetResolver,
        { provide: PageLayoutWidgetService, useValue: {} },
        { provide: ApplicationTranslationCatalogService, useValue: {} },
        { provide: PermissionsService, useValue: {} },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
      ],
    }).compile();

    resolver = moduleRef.get(PageLayoutWidgetResolver);
  });

  beforeEach(() => {
    workspaceCacheService.getOrRecompute.mockReset();
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatApplicationMaps: {
        byId: {
          [APPLICATION_ID]: {
            name: 'Phone',
            grantedIframeMediaPermissions: [MICROPHONE_PERMISSION],
          },
          [OTHER_APPLICATION_ID]: {
            name: 'Video',
            grantedIframeMediaPermissions: [CAMERA_PERMISSION],
          },
        },
      },
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('uses the authenticated workspace and owning app without borrowing grants from another app', async () => {
    const widget = { applicationId: APPLICATION_ID };
    const workspace = { id: WORKSPACE_ID };

    expect(await resolver.applicationName(widget, workspace)).toBe('Phone');
    expect(
      await resolver.applicationGrantedIframeMediaPermissions(
        widget,
        workspace,
      ),
    ).toEqual([MICROPHONE_PERMISSION]);
    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
      WORKSPACE_ID,
      ['flatApplicationMaps'],
    );
  });

  it('returns no grants for a missing owner while another app has permission for the origin', async () => {
    const widget = { applicationId: 'missing-application' };
    const workspace = { id: WORKSPACE_ID };

    expect(await resolver.applicationName(widget, workspace)).toBeUndefined();
    expect(
      await resolver.applicationGrantedIframeMediaPermissions(
        widget,
        workspace,
      ),
    ).toEqual([]);
  });
});
