import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';

import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { extractFolderPathAndFilename } from 'src/engine/core-modules/file/utils/extract-folderpath-and-filename.utils';
import { TestHttpRequestResult } from 'src/engine/metadata-modules/workflow-version-step-http-request-test/types/test-http-request-result.type';
import { getPathsFromStepHttpRequestIfBodyTypeFormData } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/getPathsFromStepHttpRequestIfBodyTypeFormData';
import { parseBodyJson } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/parseBodyJson';
import {
  FormDataFile,
  WorkflowHttpRequestActionInput,
} from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class WorkflowVersionStepHttpRequestTestService {
  constructor(private readonly fileService: FileService) {}

  private async getBufferWithPaths(
    paths: string[] | null,
    workspaceId: string,
  ): Promise<{ path: string; buffer: Buffer }[]> {
    if (paths === null) return [];

    return Promise.all(
      paths.map(async (path) => {
        const { folderPath, filename } = extractFolderPathAndFilename(path);

        const fileStream = await this.fileService.getFileStream(
          folderPath,
          filename,
          workspaceId,
        );

        const fileBuffer = await streamToBuffer(fileStream as Readable);

        return { path, buffer: fileBuffer };
      }),
    );
  }

  async getFormDataValues({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: WorkflowHttpRequestActionInput;
  }): Promise<FormData | null> {
    let body = input.body;

    if (typeof body === 'string') {
      body = parseBodyJson(body);
    }
    if (!body || typeof body !== 'object') return null;
    const inputWithNewBody = {
      ...input,
      body,
    };
    const paths =
      getPathsFromStepHttpRequestIfBodyTypeFormData(inputWithNewBody);

    const formData = new FormData();

    if (!paths) {
      Object.entries(body).forEach(([key, value]) => {
        if (typeof value === 'string') {
          formData.append(key, value as string);
        } else {
          formData.append(key, value);
        }
      });

      return formData;
    }
    const filesBufferWithPaths = await this.getBufferWithPaths(
      paths,
      workspaceId,
    );

    const pathToBuffer = new Map(
      filesBufferWithPaths.map((f) => [f.path, f.buffer]),
    );

    Object.entries(body).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === 'object' && value[0] !== null) {
          (value as FormDataFile[]).forEach((file) => {
            if (pathToBuffer.has(file.path)) {
              const buffer = pathToBuffer.get(file.path);

              if (buffer) {
                formData.append(key, buffer as Buffer, {
                  filename: file.filename,
                });
              }
            }
          });
        }
      } else if (typeof value === 'string') {
        formData.append(key, value as string);
      }
    });

    return formData;
  }

  async testHttpRequest({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: WorkflowHttpRequestActionInput;
  }): Promise<TestHttpRequestResult> {
    try {
      const url = input.url;
      const method = input.method;
      const headers = input.headers || {};
      const axiosConfig: AxiosRequestConfig = {
        url,
        method,
        headers,
        maxBodyLength: Infinity,
      };
      const isMethodForBody = ['POST', 'PUT', 'PATCH'].includes(method);

      if (isMethodForBody && input.bodyType === 'FormData') {
        const formData = await this.getFormDataValues({ workspaceId, input });

        if (formData) {
          axiosConfig.data = formData;
          if (headers['Content-Type'] || headers['content-type']) {
            delete headers['Content-Type'];
            delete headers['content-type'];
          }
          axiosConfig.headers = {
            ...headers,
            ...formData.getHeaders(),
          };
        }
      } else if (isMethodForBody && input.body) {
        axiosConfig.data = input.body;
      }

      const response = await axios(axiosConfig);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data:
          typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data),
        error: undefined,
      };
    } catch (error) {
      return {
        status: undefined,
        statusText: undefined,
        headers: undefined,
        data: undefined,
        error: error?.message,
      };
    }
  }
}
