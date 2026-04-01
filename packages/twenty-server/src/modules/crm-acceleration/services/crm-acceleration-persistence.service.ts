import { Injectable } from '@nestjs/common';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { type CrmFeatureId } from 'src/modules/crm-acceleration/types/crm-acceleration.types';

type FeatureExecutionRecord = {
  executionId: string;
  featureId: CrmFeatureId;
  route: string;
  executedAt: string;
  payload: unknown;
  result: unknown;
};

type FeatureExecutionState = {
  featureId: CrmFeatureId;
  latest: FeatureExecutionRecord | null;
  history: FeatureExecutionRecord[];
};

type CrmAccelerationStateMap = Record<string, FeatureExecutionState>;

const FEATURE_KEY_PREFIX = 'crm_acceleration.feature';
const SUMMARY_KEY = 'crm_acceleration.summary';
const MAX_HISTORY_SIZE = 20;

@Injectable()
export class CrmAccelerationPersistenceService {
  constructor(private readonly keyValuePairService: KeyValuePairService) {}

  private getStateKey(featureId: CrmFeatureId) {
    return `${FEATURE_KEY_PREFIX}.${featureId}.state`;
  }

  private createExecutionRecord(input: {
    featureId: CrmFeatureId;
    route: string;
    payload: unknown;
    result: unknown;
  }): FeatureExecutionRecord {
    return {
      executionId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      featureId: input.featureId,
      route: input.route,
      executedAt: new Date().toISOString(),
      payload: input.payload,
      result: input.result,
    };
  }

  private async getFeatureStateInternal(
    workspaceId: string,
    featureId: CrmFeatureId,
  ): Promise<FeatureExecutionState> {
    const records = await this.keyValuePairService.get({
      type: KeyValuePairType.USER_VARIABLE,
      userId: null,
      workspaceId,
      key: this.getStateKey(featureId),
    });

    const latestStored = records[0] as { value?: FeatureExecutionState } | undefined;

    if (latestStored?.value) {
      return latestStored.value;
    }

    return {
      featureId,
      latest: null,
      history: [],
    };
  }

  async saveFeatureExecution(input: {
    workspaceId: string;
    featureId: CrmFeatureId;
    route: string;
    payload: unknown;
    result: unknown;
  }) {
    const currentState = await this.getFeatureStateInternal(
      input.workspaceId,
      input.featureId,
    );

    const latestRecord = this.createExecutionRecord({
      featureId: input.featureId,
      route: input.route,
      payload: input.payload,
      result: input.result,
    });

    const updatedState: FeatureExecutionState = {
      featureId: input.featureId,
      latest: latestRecord,
      history: [latestRecord, ...currentState.history].slice(0, MAX_HISTORY_SIZE),
    };

    await this.keyValuePairService.set({
      type: KeyValuePairType.USER_VARIABLE,
      userId: null,
      workspaceId: input.workspaceId,
      key: this.getStateKey(input.featureId),
      value: updatedState,
    });

    await this.keyValuePairService.set({
      type: KeyValuePairType.USER_VARIABLE,
      userId: null,
      workspaceId: input.workspaceId,
      key: SUMMARY_KEY,
      value: {
        lastUpdatedAt: latestRecord.executedAt,
        lastUpdatedFeatureId: input.featureId,
      },
    });

    return updatedState;
  }

  async getFeatureState(workspaceId: string, featureId: CrmFeatureId) {
    return this.getFeatureStateInternal(workspaceId, featureId);
  }

  async getFeatureStates(
    workspaceId: string,
    featureIds: CrmFeatureId[],
  ): Promise<CrmAccelerationStateMap> {
    const states = await Promise.all(
      featureIds.map((featureId) =>
        this.getFeatureStateInternal(workspaceId, featureId),
      ),
    );

    return states.reduce<CrmAccelerationStateMap>((accumulator, state) => {
      accumulator[String(state.featureId)] = state;
      return accumulator;
    }, {});
  }
}
