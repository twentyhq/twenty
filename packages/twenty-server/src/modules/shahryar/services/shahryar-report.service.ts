import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { SHAHRYAR_REPORT_SOURCE } from 'src/modules/shahryar/constants/shahryar-report-source.constant';
import {
  type ShahryarCreateRecordRequestDTO,
  type ShahryarCreateRecordResponseDTO,
  type ShahryarRecordSectionDTO,
} from 'src/modules/shahryar/dtos/shahryar-record-section.dto';
import { type ShahryarReportSummaryDTO } from 'src/modules/shahryar/dtos/shahryar-report.dto';
import {
  type ShahryarReportAbsenceRecord,
  type ShahryarReportMarketRecord,
  type ShahryarReportPaymentRecord,
  type ShahryarReportPenaltyRecord,
  type ShahryarReportSource,
  type ShahryarReportSupervisorRecord,
  type ShahryarReportVisitRecord,
  type ShahryarReportWorkingTimeRecord,
} from 'src/modules/shahryar/types/shahryar-report-source.type';
import { buildShahryarReportCsv } from 'src/modules/shahryar/utils/build-shahryar-report-csv.util';
import { buildShahryarReportExcelXml } from 'src/modules/shahryar/utils/build-shahryar-report-excel-xml.util';
import { buildShahryarReportPdf } from 'src/modules/shahryar/utils/build-shahryar-report-pdf.util';
import { buildShahryarReportSummary } from 'src/modules/shahryar/utils/build-shahryar-report-summary.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type DataSource } from 'typeorm';

type WorkspaceMemberReportRow = {
  id: string;
  nameFirstName?: string | null;
  nameLastName?: string | null;
};

type ShahryarMarketReportRow = {
  id: string;
  name: string;
  assignedSupervisorId: string;
  isActiveMarket?: boolean | null;
  ownerName?: string | null;
  phoneNumber?: string | null;
  marketAddress?: string | null;
  district?: string | null;
  gpsLocation?: string | null;
  paymentStatus?: string | null;
  balanceAmount?: number | string | null;
  shopPhotos?: unknown;
  notes?: string | null;
};

type ShahryarVisitReportRow = {
  id: string;
  marketId: string;
  supervisorId: string;
  checkInAt: Date | string;
  gpsLocation?: string | null;
  soldCartons?: number | string | null;
  requestedCartons?: number | string | null;
  issue?: string | null;
  decisionMaker?: string | null;
  photos?: unknown;
  requestDetails?: string | null;
  report?: string | null;
};

type ShahryarWorkingTimeReportRow = {
  id: string;
  supervisorId: string;
  workDate: Date | string;
  checkInAt: Date | string;
  checkOutAt?: Date | string | null;
  gpsLocation?: string | null;
  totalMinutes?: number | string | null;
  status?: string | null;
};

type ShahryarPaymentReportRow = {
  id: string;
  marketId: string;
  collectedById: string;
  paidAt?: Date | string | null;
  dueDate?: Date | string | null;
  amount?: number | string | null;
  status?: string | null;
  notes?: string | null;
};

type ShahryarPenaltyReportRow = {
  id: string;
  supervisorId: string;
  penaltyDate: Date | string;
  amount?: number | string | null;
  reason?: string | null;
  decidedBy?: string | null;
};

type ShahryarAbsenceReportRow = {
  id: string;
  supervisorId: string;
  absenceDate: Date | string;
  reason?: string | null;
  workingTime?: string | null;
  gpsLocation?: string | null;
  notes?: string | null;
};

type ShahryarWorkspaceRecordIdRow = {
  id: string;
};

type ShahryarReportAccessOptions = {
  authorizedSupervisorId?: string;
  referenceDate?: string;
};

type ShahryarFilesFieldItemLike = {
  fileId: string;
  label: string;
};

const SHAHRYAR_RECORD_SECTION_PATHS = {
  Markets: '/shahryar/markets',
  SupervisorVisits: '/shahryar/supervisor-visits',
  WorkingTimes: '/shahryar/working-times',
  Payments: '/shahryar/payments',
  SupervisorPenalties: '/shahryar/supervisor-penalties',
  Absences: '/shahryar/absences',
} as const;

const SHAHRYAR_SUPERVISOR_WRITABLE_RECORD_SECTION_PATHS: string[] = [
  SHAHRYAR_RECORD_SECTION_PATHS.SupervisorVisits,
  SHAHRYAR_RECORD_SECTION_PATHS.WorkingTimes,
  SHAHRYAR_RECORD_SECTION_PATHS.Payments,
];

const SHAHRYAR_SUPERVISOR_ALIAS_USERNAMES: Record<string, string> = {
  کاروان: 'karwan',
  هەڵۆ: 'halo',
  بەهروز: 'behroz',
  ئەدمین: 'tedmin',
};

const quotePostgresIdentifier = (identifier: string): string =>
  `"${identifier.replace(/"/g, '""')}"`;

const toWorkspaceTableName = ({
  tableName,
  workspaceId,
}: {
  tableName: string;
  workspaceId: string;
}): string =>
  `${quotePostgresIdentifier(
    getWorkspaceSchemaName(workspaceId),
  )}.${quotePostgresIdentifier(tableName)}`;

const toIsoString = (value: Date | string | null | undefined): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return new Date(0).toISOString();
};

const toDateKey = (value: Date | string | null | undefined): string =>
  toIsoString(value).slice(0, 10);

const toNumber = (value: number | string | null | undefined): number => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const toDisplayText = (value: number | string | null | undefined): string => {
  if (value === undefined || value === null) {
    return '-';
  }

  const textValue = String(value).trim();

  return textValue.length === 0 ? '-' : textValue;
};

const toDisplayDate = (value: string | undefined): string =>
  value === undefined ? '-' : value.slice(0, 10);

const toDisplayTime = (value: string | undefined): string =>
  value === undefined ? '-' : value.slice(11, 16);

const toDisplayAmount = (value: number | undefined): string =>
  (value ?? 0).toLocaleString('en-US');

const isFilesFieldItemLike = (
  value: unknown,
): value is ShahryarFilesFieldItemLike =>
  value !== null &&
  typeof value === 'object' &&
  'fileId' in value &&
  typeof value.fileId === 'string' &&
  'label' in value &&
  typeof value.label === 'string';

const toFilesFieldItemCount = (value: unknown): number => {
  try {
    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;

    return Array.isArray(parsedValue)
      ? parsedValue.filter(isFilesFieldItemLike).length
      : 0;
  } catch {
    return 0;
  }
};

const toDisplayPhotoCount = (value: number | undefined): string => {
  if (value === undefined || value === 0) {
    return '-';
  }

  return `${value} وێنە`;
};

const toMarketPaymentStatusLabel = (
  paymentStatus: string | undefined,
): string => {
  if (paymentStatus === 'PAID') {
    return 'پارەدان کرا';
  }

  if (paymentStatus === 'PARTIAL') {
    return 'بەشێک دراوە';
  }

  return 'قەرز ماوە';
};

const toPaymentStatusLabel = (status: string | undefined): string => {
  if (status === 'CLOSED') {
    return 'داخراو';
  }

  if (status === 'PARTIAL') {
    return 'بەشێک دراوە';
  }

  return 'کراوە';
};

const toWorkingTimeStatusLabel = (status: string | undefined): string => {
  if (status === 'PRESENT') {
    return 'ئامادە';
  }

  if (status === 'LATE') {
    return 'درەنگ';
  }

  return 'غیاب';
};

const toMarketPaymentStatusValue = (paymentStatus: string): string => {
  if (paymentStatus.includes('پارەدان') || paymentStatus === 'PAID') {
    return 'PAID';
  }

  if (paymentStatus.includes('بەش') || paymentStatus === 'PARTIAL') {
    return 'PARTIAL';
  }

  return 'DEBT_OPEN';
};

const toPaymentStatusValue = (status: string): string => {
  if (status.includes('داخراو') || status === 'CLOSED') {
    return 'CLOSED';
  }

  if (status.includes('بەش') || status === 'PARTIAL') {
    return 'PARTIAL';
  }

  return 'OPEN';
};

const toWorkingTimeStatusValue = (status: string): string => {
  if (status.includes('درەنگ') || status === 'LATE') {
    return 'LATE';
  }

  if (status.includes('غیاب') || status === 'ABSENT') {
    return 'ABSENT';
  }

  return 'PRESENT';
};

const toAbsenceReasonValue = (reason: string): string => {
  if (reason.includes('درەنگ') || reason === 'LATE') {
    return 'LATE';
  }

  if (reason.includes('کار') || reason === 'NO_WORK') {
    return 'NO_WORK';
  }

  return 'ABSENT';
};

const getFormValue = (
  values: Record<string, string>,
  fieldName: string,
): string => values[fieldName]?.trim() ?? '';

const toNumberInput = (value: string): number => {
  const numericValue = Number(value.replace(/,/g, ''));

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const toIsoDateInput = (value: string, fallbackDate: string): string => {
  if (value.length === 0) {
    return new Date(fallbackDate).toISOString();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date(fallbackDate).toISOString()
    : date.toISOString();
};

const toIsoDateTimeInput = (value: string, fallbackDate: string): string => {
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    const [hour = '00', minute = '00'] = value.split(':');

    return new Date(
      `${fallbackDate}T${hour.padStart(2, '0')}:${minute}:00.000Z`,
    ).toISOString();
  }

  return toIsoDateInput(value, `${fallbackDate}T00:00:00.000Z`);
};

@Injectable()
export class ShahryarReportService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async getSummary(
    workspaceId?: string,
    options: ShahryarReportAccessOptions = {},
  ): Promise<ShahryarReportSummaryDTO> {
    return buildShahryarReportSummary(
      await this.getReportSource(workspaceId, options),
    );
  }

  async getCsvExport(
    workspaceId?: string,
    options: ShahryarReportAccessOptions = {},
  ): Promise<string> {
    return buildShahryarReportCsv(await this.getSummary(workspaceId, options));
  }

  async getExcelExport(
    workspaceId?: string,
    options: ShahryarReportAccessOptions = {},
  ): Promise<string> {
    return buildShahryarReportExcelXml(
      await this.getSummary(workspaceId, options),
    );
  }

  async getPdfExport(
    workspaceId?: string,
    options: ShahryarReportAccessOptions = {},
  ): Promise<Buffer> {
    return await buildShahryarReportPdf(
      await this.getSummary(workspaceId, options),
    );
  }

  async getRecordSections(
    workspaceId?: string,
    options: ShahryarReportAccessOptions = {},
  ): Promise<ShahryarRecordSectionDTO[]> {
    const source = await this.getReportSource(workspaceId, options);
    const supervisorNameById = new Map(
      source.supervisors.map((supervisor) => [supervisor.id, supervisor.name]),
    );
    const marketNameById = new Map(
      source.markets.map((market) => [market.id, market.name]),
    );
    const getSupervisorName = (supervisorId: string) =>
      supervisorNameById.get(supervisorId) ?? supervisorId;
    const getMarketName = (marketId: string) =>
      marketNameById.get(marketId) ?? marketId;

    const sections = [
      {
        path: SHAHRYAR_RECORD_SECTION_PATHS.Markets,
        rows: source.markets.map((market) => [
          market.name,
          toDisplayText(market.ownerName),
          toDisplayText(market.phoneNumber),
          toDisplayText(market.address),
          toDisplayText(market.gpsLocation),
          toDisplayPhotoCount(market.photoCount),
          toMarketPaymentStatusLabel(market.paymentStatus),
          toDisplayText(market.notes),
        ]),
      },
      {
        path: SHAHRYAR_RECORD_SECTION_PATHS.SupervisorVisits,
        rows: source.visits.map((visit) => [
          getSupervisorName(visit.supervisorId),
          getMarketName(visit.marketId),
          toDisplayTime(visit.visitedAt),
          toDisplayText(visit.gpsLocation),
          toDisplayPhotoCount(visit.photoCount),
          toDisplayAmount(visit.soldCartons),
          toDisplayText(visit.issue),
          toDisplayText(visit.decisionMaker),
          toDisplayText(visit.requestDetails),
          toDisplayText(visit.report),
        ]),
      },
      {
        path: SHAHRYAR_RECORD_SECTION_PATHS.WorkingTimes,
        rows: source.workingTimes.map((workingTime) => [
          getSupervisorName(workingTime.supervisorId),
          toDisplayDate(workingTime.workDate),
          toDisplayTime(workingTime.startedAt),
          toDisplayTime(workingTime.endedAt),
          toDisplayText(workingTime.gpsLocation),
          toDisplayAmount(workingTime.totalMinutes),
          toWorkingTimeStatusLabel(workingTime.status),
        ]),
      },
      {
        path: SHAHRYAR_RECORD_SECTION_PATHS.Payments,
        rows: source.payments.map((payment) => [
          getMarketName(payment.marketId),
          toDisplayAmount(payment.amount),
          toPaymentStatusLabel(payment.status),
          toDisplayDate(payment.paidAt),
          toDisplayText(payment.notes),
        ]),
      },
      {
        path: SHAHRYAR_RECORD_SECTION_PATHS.SupervisorPenalties,
        rows: source.penalties.map((penalty) => [
          getSupervisorName(penalty.supervisorId),
          toDisplayText(penalty.reason),
          toDisplayAmount(penalty.amount),
          toDisplayDate(penalty.issuedAt),
          toDisplayText(penalty.decidedBy),
        ]),
      },
      {
        path: SHAHRYAR_RECORD_SECTION_PATHS.Absences,
        rows: source.absences.map((absence) => [
          getSupervisorName(absence.supervisorId),
          toDisplayDate(absence.absenceDate),
          toDisplayText(absence.workingTime),
          toDisplayText(absence.gpsLocation),
          toDisplayText(absence.notes ?? absence.reason),
        ]),
      },
    ];

    return sections.map((section) => ({
      ...section,
      canCreate: this.canCreateRecordInSection({
        authorizedSupervisorId: options.authorizedSupervisorId,
        path: section.path,
      }),
    }));
  }

  async createRecord({
    authorizedSupervisorId,
    request,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    request: ShahryarCreateRecordRequestDTO;
    workspaceId: string;
  }): Promise<ShahryarCreateRecordResponseDTO> {
    const createdAt = new Date().toISOString();
    const referenceDate = createdAt.slice(0, 10);

    this.assertCanCreateRecordInSection({
      authorizedSupervisorId,
      path: request.path,
    });

    switch (request.path) {
      case SHAHRYAR_RECORD_SECTION_PATHS.Markets:
        return await this.createMarketRecord({
          createdAt,
          values: request.values,
          workspaceId,
        });
      case SHAHRYAR_RECORD_SECTION_PATHS.SupervisorVisits:
        return await this.createSupervisorVisitRecord({
          authorizedSupervisorId,
          createdAt,
          referenceDate,
          values: request.values,
          workspaceId,
        });
      case SHAHRYAR_RECORD_SECTION_PATHS.WorkingTimes:
        return await this.createWorkingTimeRecord({
          authorizedSupervisorId,
          createdAt,
          referenceDate,
          values: request.values,
          workspaceId,
        });
      case SHAHRYAR_RECORD_SECTION_PATHS.Payments:
        return await this.createPaymentRecord({
          authorizedSupervisorId,
          createdAt,
          referenceDate,
          values: request.values,
          workspaceId,
        });
      case SHAHRYAR_RECORD_SECTION_PATHS.SupervisorPenalties:
        return await this.createSupervisorPenaltyRecord({
          createdAt,
          referenceDate,
          values: request.values,
          workspaceId,
        });
      case SHAHRYAR_RECORD_SECTION_PATHS.Absences:
        return await this.createAbsenceRecord({
          createdAt,
          referenceDate,
          values: request.values,
          workspaceId,
        });
      default:
        throw new BadRequestException('Unsupported Shahryar record section');
    }
  }

  private assertCanCreateRecordInSection({
    authorizedSupervisorId,
    path,
  }: {
    authorizedSupervisorId?: string;
    path: string;
  }): void {
    if (
      this.canCreateRecordInSection({
        authorizedSupervisorId,
        path,
      })
    ) {
      return;
    }

    throw new ForbiddenException(
      'Supervisors can only create their own operational records.',
    );
  }

  private canCreateRecordInSection({
    authorizedSupervisorId,
    path,
  }: {
    authorizedSupervisorId?: string;
    path: string;
  }): boolean {
    if (authorizedSupervisorId === undefined) {
      return true;
    }

    return SHAHRYAR_SUPERVISOR_WRITABLE_RECORD_SECTION_PATHS.includes(path);
  }

  private async createMarketRecord({
    createdAt,
    values,
    workspaceId,
  }: {
    createdAt: string;
    values: Record<string, string>;
    workspaceId: string;
  }): Promise<ShahryarCreateRecordResponseDTO> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarMarket',
      workspaceId,
    });
    const name = getFormValue(values, 'name');
    const ownerName = getFormValue(values, 'ownerName');
    const phoneNumber = getFormValue(values, 'phoneNumber');
    const address = getFormValue(values, 'marketAddress');
    const gpsLocation = getFormValue(values, 'gpsLocation');
    const paymentStatus = toMarketPaymentStatusValue(
      getFormValue(values, 'paymentStatus'),
    );
    const notes = getFormValue(values, 'notes');
    const supervisorId = await this.resolveWorkspaceMemberId({
      label: getFormValue(values, 'assignedSupervisor'),
      workspaceId,
    });
    const id = randomUUID();

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "ownerName",
        "phoneNumber",
        "assignedSupervisorId",
        "gpsLocation",
        "marketAddress",
        "district",
        "paymentStatus",
        "balanceAmount",
        "notes",
        "isActiveMarket",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, '', $8, 0, $9, TRUE, $10)`,
      [
        id,
        name,
        ownerName,
        phoneNumber,
        supervisorId,
        gpsLocation,
        address,
        paymentStatus,
        notes,
        createdAt,
      ],
    );

    return {
      id,
      path: SHAHRYAR_RECORD_SECTION_PATHS.Markets,
      row: [
        toDisplayText(name),
        toDisplayText(ownerName),
        toDisplayText(phoneNumber),
        toDisplayText(address),
        toDisplayText(gpsLocation),
        '-',
        toMarketPaymentStatusLabel(paymentStatus),
        toDisplayText(notes),
      ],
      createdAt,
    };
  }

  private async createSupervisorVisitRecord({
    authorizedSupervisorId,
    createdAt,
    referenceDate,
    values,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    createdAt: string;
    referenceDate: string;
    values: Record<string, string>;
    workspaceId: string;
  }): Promise<ShahryarCreateRecordResponseDTO> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarSupervisorVisit',
      workspaceId,
    });
    const supervisorLabel = getFormValue(values, 'supervisor');
    const marketLabel = getFormValue(values, 'market');
    const checkInAt = toIsoDateTimeInput(
      getFormValue(values, 'checkInAt'),
      referenceDate,
    );
    const gpsLocation = getFormValue(values, 'gpsLocation');
    const soldCartons = toNumberInput(getFormValue(values, 'soldCartons'));
    const issue = getFormValue(values, 'issue');
    const decisionMaker = getFormValue(values, 'decisionMaker');
    const requestDetails = getFormValue(values, 'requestDetails');
    const report = getFormValue(values, 'report');
    const supervisorId = await this.resolveSupervisorOwnerId({
      authorizedSupervisorId,
      label: supervisorLabel,
      workspaceId,
    });
    const marketId = await this.resolveRecordIdByName({
      label: marketLabel,
      tableName: '_shahryarMarket',
      workspaceId,
    });
    const id = randomUUID();

    if (authorizedSupervisorId !== undefined) {
      await this.assertMarketAssignedToSupervisor({
        marketId,
        supervisorId,
        workspaceId,
      });
    }

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "marketId",
        "supervisorId",
        "checkInAt",
        "checkOutAt",
        "gpsLocation",
        "soldCartons",
        "requestedCartons",
        "issue",
        "decisionMaker",
        "requestDetails",
        "report",
        "notes",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, 0, $8, $9, $10, $11, $11, $12)`,
      [
        id,
        `سەردانی ${marketLabel}`,
        marketId,
        supervisorId,
        checkInAt,
        gpsLocation,
        soldCartons,
        issue,
        decisionMaker,
        requestDetails,
        report,
        createdAt,
      ],
    );

    return {
      id,
      path: SHAHRYAR_RECORD_SECTION_PATHS.SupervisorVisits,
      row: [
        toDisplayText(supervisorLabel),
        toDisplayText(marketLabel),
        toDisplayTime(checkInAt),
        toDisplayText(gpsLocation),
        '-',
        toDisplayAmount(soldCartons),
        toDisplayText(issue),
        toDisplayText(decisionMaker),
        toDisplayText(requestDetails),
        toDisplayText(report),
      ],
      createdAt,
    };
  }

  private async createWorkingTimeRecord({
    authorizedSupervisorId,
    createdAt,
    referenceDate,
    values,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    createdAt: string;
    referenceDate: string;
    values: Record<string, string>;
    workspaceId: string;
  }): Promise<ShahryarCreateRecordResponseDTO> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarWorkingTime',
      workspaceId,
    });
    const supervisorLabel = getFormValue(values, 'supervisor');
    const workDate = toIsoDateInput(
      getFormValue(values, 'workDate'),
      referenceDate,
    );
    const checkInAt = toIsoDateTimeInput(
      getFormValue(values, 'checkInAt'),
      workDate.slice(0, 10),
    );
    const checkOutAtValue = getFormValue(values, 'checkOutAt');
    const checkOutAt =
      checkOutAtValue.length === 0
        ? null
        : toIsoDateTimeInput(checkOutAtValue, workDate.slice(0, 10));
    const gpsLocation = getFormValue(values, 'gpsLocation');
    const totalMinutes = toNumberInput(getFormValue(values, 'totalMinutes'));
    const status = toWorkingTimeStatusValue(getFormValue(values, 'status'));
    const supervisorId = await this.resolveSupervisorOwnerId({
      authorizedSupervisorId,
      label: supervisorLabel,
      workspaceId,
    });
    const id = randomUUID();

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "supervisorId",
        "workDate",
        "checkInAt",
        "checkOutAt",
        "gpsLocation",
        "totalMinutes",
        "status",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        `${supervisorLabel} - ${workDate.slice(0, 10)}`,
        supervisorId,
        workDate,
        checkInAt,
        checkOutAt,
        gpsLocation,
        totalMinutes,
        status,
        createdAt,
      ],
    );

    return {
      id,
      path: SHAHRYAR_RECORD_SECTION_PATHS.WorkingTimes,
      row: [
        toDisplayText(supervisorLabel),
        toDisplayDate(workDate),
        toDisplayTime(checkInAt),
        toDisplayTime(checkOutAt ?? undefined),
        toDisplayText(gpsLocation),
        toDisplayAmount(totalMinutes),
        toWorkingTimeStatusLabel(status),
      ],
      createdAt,
    };
  }

  private async createPaymentRecord({
    authorizedSupervisorId,
    createdAt,
    referenceDate,
    values,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    createdAt: string;
    referenceDate: string;
    values: Record<string, string>;
    workspaceId: string;
  }): Promise<ShahryarCreateRecordResponseDTO> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarPayment',
      workspaceId,
    });
    const marketLabel = getFormValue(values, 'market');
    const amount = toNumberInput(getFormValue(values, 'amount'));
    const status = toPaymentStatusValue(getFormValue(values, 'status'));
    const paidAt = toIsoDateInput(
      getFormValue(values, 'paymentDate'),
      referenceDate,
    );
    const notes = getFormValue(values, 'notes');
    const marketId = await this.resolveRecordIdByName({
      label: marketLabel,
      tableName: '_shahryarMarket',
      workspaceId,
    });
    const collectedById = await this.resolveSupervisorOwnerId({
      authorizedSupervisorId,
      label: getFormValue(values, 'collectedBy'),
      workspaceId,
    });
    const id = randomUUID();

    if (authorizedSupervisorId !== undefined) {
      await this.assertMarketAssignedToSupervisor({
        marketId,
        supervisorId: collectedById,
        workspaceId,
      });
    }

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "marketId",
        "collectedById",
        "amount",
        "dueDate",
        "paidAt",
        "status",
        "notes",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9)`,
      [
        id,
        `${marketLabel} - ${amount}`,
        marketId,
        collectedById,
        amount,
        paidAt,
        status,
        notes,
        createdAt,
      ],
    );

    return {
      id,
      path: SHAHRYAR_RECORD_SECTION_PATHS.Payments,
      row: [
        toDisplayText(marketLabel),
        toDisplayAmount(amount),
        toPaymentStatusLabel(status),
        toDisplayDate(paidAt),
        toDisplayText(notes),
      ],
      createdAt,
    };
  }

  private async createSupervisorPenaltyRecord({
    createdAt,
    referenceDate,
    values,
    workspaceId,
  }: {
    createdAt: string;
    referenceDate: string;
    values: Record<string, string>;
    workspaceId: string;
  }): Promise<ShahryarCreateRecordResponseDTO> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarSupervisorPenalty',
      workspaceId,
    });
    const supervisorLabel = getFormValue(values, 'supervisor');
    const reason = getFormValue(values, 'reason');
    const amount = toNumberInput(getFormValue(values, 'amount'));
    const penaltyDate = toIsoDateInput(
      getFormValue(values, 'penaltyDate'),
      referenceDate,
    );
    const decidedBy = getFormValue(values, 'decidedBy');
    const supervisorId = await this.resolveWorkspaceMemberId({
      label: supervisorLabel,
      workspaceId,
    });
    const id = randomUUID();

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "supervisorId",
        "reason",
        "amount",
        "penaltyDate",
        "decidedBy",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        `${supervisorLabel} - ${reason}`,
        supervisorId,
        reason,
        amount,
        penaltyDate,
        decidedBy,
        createdAt,
      ],
    );

    return {
      id,
      path: SHAHRYAR_RECORD_SECTION_PATHS.SupervisorPenalties,
      row: [
        toDisplayText(supervisorLabel),
        toDisplayText(reason),
        toDisplayAmount(amount),
        toDisplayDate(penaltyDate),
        toDisplayText(decidedBy),
      ],
      createdAt,
    };
  }

  private async createAbsenceRecord({
    createdAt,
    referenceDate,
    values,
    workspaceId,
  }: {
    createdAt: string;
    referenceDate: string;
    values: Record<string, string>;
    workspaceId: string;
  }): Promise<ShahryarCreateRecordResponseDTO> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarAbsence',
      workspaceId,
    });
    const supervisorLabel = getFormValue(values, 'supervisor');
    const absenceDate = toIsoDateInput(
      getFormValue(values, 'absenceDate'),
      referenceDate,
    );
    const workingTime = getFormValue(values, 'workingTime');
    const gpsLocation = getFormValue(values, 'gpsLocation');
    const notes = getFormValue(values, 'notes');
    const reason = toAbsenceReasonValue(notes);
    const supervisorId = await this.resolveWorkspaceMemberId({
      label: supervisorLabel,
      workspaceId,
    });
    const id = randomUUID();

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "supervisorId",
        "absenceDate",
        "workingTime",
        "gpsLocation",
        "reason",
        "notes",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        `${supervisorLabel} - ${absenceDate.slice(0, 10)}`,
        supervisorId,
        absenceDate,
        workingTime,
        gpsLocation,
        reason,
        notes,
        createdAt,
      ],
    );

    return {
      id,
      path: SHAHRYAR_RECORD_SECTION_PATHS.Absences,
      row: [
        toDisplayText(supervisorLabel),
        toDisplayDate(absenceDate),
        toDisplayText(workingTime),
        toDisplayText(gpsLocation),
        toDisplayText(notes),
      ],
      createdAt,
    };
  }

  private async resolveWorkspaceMemberId({
    label,
    workspaceId,
  }: {
    label: string;
    workspaceId: string;
  }): Promise<string> {
    const lookupLabel = label.length === 0 ? undefined : label;
    const aliasUsername =
      lookupLabel === undefined
        ? undefined
        : SHAHRYAR_SUPERVISOR_ALIAS_USERNAMES[lookupLabel];
    const [workspaceMember] = (await this.coreDataSource.query(
      `SELECT "id"
       FROM ${toWorkspaceTableName({ tableName: 'workspaceMember', workspaceId })}
       WHERE "deletedAt" IS NULL
       AND (
         $1::text IS NULL
         OR LOWER(TRIM(CONCAT_WS(' ', "nameFirstName", "nameLastName"))) = LOWER($1)
         OR LOWER("nameFirstName") = LOWER($1)
         OR LOWER(COALESCE("username", '')) = LOWER(COALESCE($2, $1))
       )
       ORDER BY "nameFirstName" ASC
       LIMIT 1`,
      [lookupLabel ?? null, aliasUsername ?? null],
    )) as ShahryarWorkspaceRecordIdRow[];

    if (workspaceMember === undefined) {
      throw new BadRequestException('Workspace member was not found');
    }

    return workspaceMember.id;
  }

  private async resolveSupervisorOwnerId({
    authorizedSupervisorId,
    label,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    label: string;
    workspaceId: string;
  }): Promise<string> {
    if (authorizedSupervisorId === undefined) {
      return await this.resolveWorkspaceMemberId({ label, workspaceId });
    }

    if (label.length === 0) {
      return authorizedSupervisorId;
    }

    const resolvedSupervisorId = await this.resolveWorkspaceMemberId({
      label,
      workspaceId,
    });

    if (resolvedSupervisorId !== authorizedSupervisorId) {
      throw new ForbiddenException(
        'Supervisors can only create records for themselves.',
      );
    }

    return resolvedSupervisorId;
  }

  private async assertMarketAssignedToSupervisor({
    marketId,
    supervisorId,
    workspaceId,
  }: {
    marketId: string;
    supervisorId: string;
    workspaceId: string;
  }): Promise<void> {
    const [market] = (await this.coreDataSource.query(
      `SELECT "id"
       FROM ${toWorkspaceTableName({ tableName: '_shahryarMarket', workspaceId })}
       WHERE "id" = $1
       AND "assignedSupervisorId" = $2
       AND "deletedAt" IS NULL
       LIMIT 1`,
      [marketId, supervisorId],
    )) as ShahryarWorkspaceRecordIdRow[];

    if (market === undefined) {
      throw new ForbiddenException(
        'Supervisors can only use their assigned markets.',
      );
    }
  }

  private async resolveRecordIdByName({
    label,
    tableName,
    workspaceId,
  }: {
    label: string;
    tableName: string;
    workspaceId: string;
  }): Promise<string> {
    const [record] = (await this.coreDataSource.query(
      `SELECT "id"
       FROM ${toWorkspaceTableName({ tableName, workspaceId })}
       WHERE "deletedAt" IS NULL
       AND LOWER("name") = LOWER($1)
       LIMIT 1`,
      [label],
    )) as ShahryarWorkspaceRecordIdRow[];

    if (record === undefined) {
      throw new BadRequestException('Referenced Shahryar record was not found');
    }

    return record.id;
  }

  private async getReportSource(
    workspaceId: string | undefined,
    options: ShahryarReportAccessOptions = {},
  ): Promise<ShahryarReportSource> {
    const source =
      workspaceId === undefined
        ? SHAHRYAR_REPORT_SOURCE
        : await this.getWorkspaceReportSource(
            workspaceId,
            options.referenceDate,
          );
    const sourceWithReferenceDate =
      options.referenceDate === undefined
        ? source
        : {
            ...source,
            referenceDate: options.referenceDate,
          };

    return this.filterReportSourceForSupervisor(
      sourceWithReferenceDate,
      options.authorizedSupervisorId,
    );
  }

  private filterReportSourceForSupervisor(
    source: ShahryarReportSource,
    authorizedSupervisorId: string | undefined,
  ): ShahryarReportSource {
    if (authorizedSupervisorId === undefined) {
      return source;
    }

    const assignedMarketIds = new Set(
      source.markets
        .filter(
          (market) => market.assignedSupervisorId === authorizedSupervisorId,
        )
        .map((market) => market.id),
    );

    return {
      ...source,
      supervisors: source.supervisors.filter(
        (supervisor) => supervisor.id === authorizedSupervisorId,
      ),
      markets: source.markets.filter((market) =>
        assignedMarketIds.has(market.id),
      ),
      visits: source.visits.filter(
        (visit) => visit.supervisorId === authorizedSupervisorId,
      ),
      workingTimes: source.workingTimes.filter(
        (workingTime) => workingTime.supervisorId === authorizedSupervisorId,
      ),
      payments: source.payments.filter(
        (payment) =>
          payment.collectedById === authorizedSupervisorId ||
          assignedMarketIds.has(payment.marketId),
      ),
      penalties: source.penalties.filter(
        (penalty) => penalty.supervisorId === authorizedSupervisorId,
      ),
      absences: source.absences.filter(
        (absence) => absence.supervisorId === authorizedSupervisorId,
      ),
    };
  }

  private async getWorkspaceReportSource(
    workspaceId: string,
    referenceDate = new Date().toISOString().slice(0, 10),
  ): Promise<ShahryarReportSource> {
    const [
      supervisorRows,
      marketRows,
      visitRows,
      workingTimeRows,
      paymentRows,
      penaltyRows,
      absenceRows,
    ] = await Promise.all([
      this.getWorkspaceRows<WorkspaceMemberReportRow>({
        tableName: 'workspaceMember',
        workspaceId,
        select:
          'SELECT "id", "nameFirstName", "nameLastName" FROM {tableName} ORDER BY "nameFirstName" ASC',
      }),
      this.getWorkspaceRows<ShahryarMarketReportRow>({
        tableName: '_shahryarMarket',
        workspaceId,
        select:
          'SELECT "id", "name", "ownerName", "phoneNumber", "marketAddress", "district", "gpsLocation", "paymentStatus", "balanceAmount", "shopPhotos", "notes", "assignedSupervisorId", "isActiveMarket" FROM {tableName} ORDER BY "name" ASC',
      }),
      this.getWorkspaceRows<ShahryarVisitReportRow>({
        tableName: '_shahryarSupervisorVisit',
        workspaceId,
        select:
          'SELECT "id", "marketId", "supervisorId", "checkInAt", "gpsLocation", "soldCartons", "requestedCartons", "photos", "issue", "decisionMaker", "requestDetails", "report" FROM {tableName} ORDER BY "checkInAt" DESC',
      }),
      this.getWorkspaceRows<ShahryarWorkingTimeReportRow>({
        tableName: '_shahryarWorkingTime',
        workspaceId,
        select:
          'SELECT "id", "supervisorId", "workDate", "checkInAt", "checkOutAt", "gpsLocation", "totalMinutes", "status" FROM {tableName} ORDER BY "workDate" DESC',
      }),
      this.getWorkspaceRows<ShahryarPaymentReportRow>({
        tableName: '_shahryarPayment',
        workspaceId,
        select:
          'SELECT "id", "marketId", "collectedById", "paidAt", "dueDate", "amount", "status", "notes" FROM {tableName} ORDER BY "paidAt" DESC',
      }),
      this.getWorkspaceRows<ShahryarPenaltyReportRow>({
        tableName: '_shahryarSupervisorPenalty',
        workspaceId,
        select:
          'SELECT "id", "supervisorId", "penaltyDate", "amount", "reason", "decidedBy" FROM {tableName} ORDER BY "penaltyDate" DESC',
      }),
      this.getWorkspaceRows<ShahryarAbsenceReportRow>({
        tableName: '_shahryarAbsence',
        workspaceId,
        select:
          'SELECT "id", "supervisorId", "absenceDate", "workingTime", "gpsLocation", "reason", "notes" FROM {tableName} ORDER BY "absenceDate" DESC',
      }),
    ]);

    const visits = this.toVisitRecords(visitRows);

    return {
      referenceDate,
      supervisors: this.toSupervisorRecords(supervisorRows),
      markets: this.toMarketRecords(marketRows),
      visits,
      workingTimes: this.toWorkingTimeRecords({
        rows: workingTimeRows,
        visits,
      }),
      payments: this.toPaymentRecords(paymentRows),
      penalties: this.toPenaltyRecords(penaltyRows),
      absences: this.toAbsenceRecords(absenceRows),
      backupStatus: SHAHRYAR_REPORT_SOURCE.backupStatus,
    };
  }

  private async getWorkspaceRows<TRecord>({
    select,
    tableName,
    workspaceId,
  }: {
    select: string;
    tableName: string;
    workspaceId: string;
  }): Promise<TRecord[]> {
    return (await this.coreDataSource.query(
      select.replace(
        '{tableName}',
        toWorkspaceTableName({ tableName, workspaceId }),
      ),
    )) as TRecord[];
  }

  private toSupervisorRecords(
    rows: WorkspaceMemberReportRow[],
  ): ShahryarReportSupervisorRecord[] {
    return rows.map((row) => ({
      id: row.id,
      name: [row.nameFirstName, row.nameLastName]
        .filter((namePart) => namePart !== undefined && namePart !== null)
        .join(' ')
        .trim(),
      isActive: true,
    }));
  }

  private toMarketRecords(
    rows: ShahryarMarketReportRow[],
  ): ShahryarReportMarketRecord[] {
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      assignedSupervisorId: row.assignedSupervisorId,
      isActive: row.isActiveMarket !== false,
      expectedVisitCadence: 'daily',
      ownerName: row.ownerName ?? undefined,
      phoneNumber: row.phoneNumber ?? undefined,
      address: row.marketAddress ?? undefined,
      district: row.district ?? undefined,
      gpsLocation: row.gpsLocation ?? undefined,
      paymentStatus: row.paymentStatus ?? undefined,
      balanceAmount: toNumber(row.balanceAmount),
      photoCount: toFilesFieldItemCount(row.shopPhotos),
      notes: row.notes ?? undefined,
    }));
  }

  private toVisitRecords(
    rows: ShahryarVisitReportRow[],
  ): ShahryarReportVisitRecord[] {
    return rows.map((row) => ({
      id: row.id,
      marketId: row.marketId,
      supervisorId: row.supervisorId,
      visitedAt: toIsoString(row.checkInAt),
      gpsLocation: row.gpsLocation ?? undefined,
      soldCartons: toNumber(row.soldCartons),
      requestedCartons: toNumber(row.requestedCartons),
      issue: row.issue ?? 'No blocker',
      decisionMaker: row.decisionMaker ?? '',
      photoCount: toFilesFieldItemCount(row.photos),
      requestDetails: row.requestDetails ?? '',
      report: row.report ?? '',
    }));
  }

  private toWorkingTimeRecords({
    rows,
    visits,
  }: {
    rows: ShahryarWorkingTimeReportRow[];
    visits: ShahryarReportVisitRecord[];
  }): ShahryarReportWorkingTimeRecord[] {
    return rows.map((row) => {
      const workDate = toDateKey(row.workDate);
      const submittedVisit = visits.find(
        (visit) =>
          visit.supervisorId === row.supervisorId &&
          toDateKey(visit.visitedAt) === workDate &&
          visit.report.trim().length > 0,
      );

      return {
        id: row.id,
        supervisorId: row.supervisorId,
        workDate,
        startedAt: toIsoString(row.checkInAt),
        endedAt:
          row.checkOutAt === undefined || row.checkOutAt === null
            ? undefined
            : toIsoString(row.checkOutAt),
        gpsLocation: row.gpsLocation ?? undefined,
        totalMinutes: toNumber(row.totalMinutes),
        status: row.status ?? undefined,
        reportSubmittedAt: submittedVisit?.visitedAt,
      };
    });
  }

  private toPaymentRecords(
    rows: ShahryarPaymentReportRow[],
  ): ShahryarReportPaymentRecord[] {
    return rows.map((row) => ({
      id: row.id,
      marketId: row.marketId,
      collectedById: row.collectedById,
      paidAt: toIsoString(row.paidAt ?? row.dueDate),
      amount: toNumber(row.amount),
      status: row.status ?? undefined,
      notes: row.notes ?? undefined,
    }));
  }

  private toPenaltyRecords(
    rows: ShahryarPenaltyReportRow[],
  ): ShahryarReportPenaltyRecord[] {
    return rows.map((row) => ({
      id: row.id,
      supervisorId: row.supervisorId,
      issuedAt: toIsoString(row.penaltyDate),
      amount: toNumber(row.amount),
      reason: row.reason ?? undefined,
      decidedBy: row.decidedBy ?? undefined,
    }));
  }

  private toAbsenceRecords(
    rows: ShahryarAbsenceReportRow[],
  ): ShahryarReportAbsenceRecord[] {
    return rows.map((row) => ({
      id: row.id,
      supervisorId: row.supervisorId,
      absenceDate: toDateKey(row.absenceDate),
      reason: row.reason ?? '',
      workingTime: row.workingTime ?? undefined,
      gpsLocation: row.gpsLocation ?? undefined,
      notes: row.notes ?? undefined,
    }));
  }
}
