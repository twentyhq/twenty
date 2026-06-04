import { HttpStatus } from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';

import { type Request } from 'express';
import { HTTPMethod } from 'twenty-shared/types';

import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { RouteTriggerController } from 'src/engine/metadata-modules/route-trigger/route-trigger.controller';

describe('RouteTriggerController', () => {
  let controller: RouteTriggerController;
  const handle = jest.fn();

  beforeEach(() => {
    const routeTriggerService = {
      handle,
    } as unknown as RouteTriggerService;

    controller = new RouteTriggerController(routeTriggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('response status code', () => {
    it.each([
      ['get', RouteTriggerController.prototype.get],
      ['post', RouteTriggerController.prototype.post],
      ['put', RouteTriggerController.prototype.put],
      ['patch', RouteTriggerController.prototype.patch],
      ['delete', RouteTriggerController.prototype.delete],
    ])('should respond with 200 for %s', (_method, handler) => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, handler);

      expect(httpCode).toBe(HttpStatus.OK);
    });
  });

  describe('post', () => {
    it('should delegate to the service with the POST http method', async () => {
      const request = { path: '/s/webhooks/google/leads' } as Request;
      const expectedResult = {};

      handle.mockResolvedValue(expectedResult);

      const result = await controller.post(request);

      expect(handle).toHaveBeenCalledWith({
        request,
        httpMethod: HTTPMethod.POST,
      });
      expect(result).toBe(expectedResult);
    });
  });
});
