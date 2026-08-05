import { ApiPath } from 'src/types/ApiPath';
import { AppBasePath } from 'src/types/AppBasePath';
import { AppPath } from 'src/types/AppPath';

const apiPaths = new Set<string>(Object.values(ApiPath));

const getFirstPathSegment = (path: string) =>
  path.replace(/^\//, '').split('/')[0];

const frontRoutes = [...Object.values(AppPath), ...Object.values(AppBasePath)];

const frontRoutesWithSegment = frontRoutes
  .map((frontRoute) => ({
    frontRoute,
    firstPathSegment: getFirstPathSegment(frontRoute),
  }))
  .filter(
    ({ firstPathSegment }) =>
      firstPathSegment !== '' && firstPathSegment !== '*',
  );

describe('ApiPath and front route collisions', () => {
  it.each(frontRoutesWithSegment)(
    'should not serve the front route $frontRoute from a path the server owns',
    ({ firstPathSegment }) => {
      expect(apiPaths.has(firstPathSegment)).toBe(false);
    },
  );

  it.each(Object.values(ApiPath))(
    'should keep the api path %s free of a front route claiming its first segment',
    (apiPath) => {
      expect(
        frontRoutesWithSegment.filter(
          ({ firstPathSegment }) => firstPathSegment === apiPath,
        ),
      ).toEqual([]);
    },
  );
});
