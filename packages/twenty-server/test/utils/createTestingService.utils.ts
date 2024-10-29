import { Provider, Type } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';

function getDependencies(service: Type<any>) {
  const dependencies = Reflect.getMetadata('design:paramtypes', service);
  // @ts-ignore
  console.log('>>>>>>>>>>>>>>', service.context);
  if (!dependencies) {
    return [];
  }

  return dependencies.reduce(
    (acc, dep) => {
      if (dep.name === 'Repository') {
        const name = getRepositoryToken(dep);
        console.log(
          '>>>>>>>>>>>>>>',
          Object.getOwnPropertyNames(dep.prototype),
        );
        console.log('>>>>>>>>>>>>>>', dep.metadata);
        acc.repositories['frite'] = dep;
      } else {
        acc.services[dep.name] = dep;
      }
      return acc;
    },
    {
      repositories: {},
      services: {},
    },
  );
}

export const createTestingService = async <T extends Type<any>>(
  service: T,
  override?: {
    repositories?: Record<string, any>;
    services?: Record<string, any>;
  },
): Promise<T> => {
  const { services, repositories } = getDependencies(service);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      service,
      // ...(Object.entries(repositories).map(([name, repository]) => ({
      //   provide: repository,
      //   useValue: override?.repositories?.[name] ?? {},
      // })) as Provider[]),
      ...(Object.entries(services).map(([name, service]) => ({
        provide: service,
        useValue: override?.services?.[name] ?? {},
      })) as Provider[]),
    ],
  }).compile();

  // @ts-ignore
  return module.get<T>(service);
};

createTestingService(AuthService);
