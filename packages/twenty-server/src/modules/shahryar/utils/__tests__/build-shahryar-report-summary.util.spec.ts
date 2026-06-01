import { SHAHRYAR_REPORT_SOURCE } from 'src/modules/shahryar/constants/shahryar-report-source.constant';
import { buildShahryarReportCsv } from 'src/modules/shahryar/utils/build-shahryar-report-csv.util';
import { buildShahryarReportExcelXml } from 'src/modules/shahryar/utils/build-shahryar-report-excel-xml.util';
import { buildShahryarReportPdf } from 'src/modules/shahryar/utils/build-shahryar-report-pdf.util';
import { buildShahryarReportSummary } from 'src/modules/shahryar/utils/build-shahryar-report-summary.util';

describe('buildShahryarReportSummary', () => {
  it('should aggregate visits, payments, penalties and notifications', () => {
    const summary = buildShahryarReportSummary(SHAHRYAR_REPORT_SOURCE);

    expect(summary.referenceDate).toBe('2026-06-01');
    expect(summary.activeMarketCount).toBe(4);
    expect(summary.activeSupervisorCount).toBe(3);
    expect(summary.totalVisits).toBe(3);
    expect(summary.totalSalesCartons).toBe(20);
    expect(summary.totalRequestedCartons).toBe(22);
    expect(summary.totalPaidAmount).toBe(430000);
    expect(summary.totalPenaltyAmount).toBe(10000);
    expect(summary.totalAbsences).toBe(1);
    expect(summary.backupStatus).toEqual({
      label: 'Healthy',
      lastRunLabel: '2026-06-01 02:15 UTC',
    });

    expect(summary.rows).toHaveLength(3);
    expect(summary.rows[0]).toMatchObject({
      period: 'daily',
      visits: 2,
      salesCartons: 12,
      requestedCartons: 20,
      paidAmount: 250000,
      penaltyAmount: 10000,
      absenceCount: 0,
    });
    expect(summary.rows[1]).toMatchObject({
      period: 'weekly',
      visits: 3,
      paidAmount: 430000,
      absenceCount: 1,
    });

    expect(summary.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'missing-report',
          supervisorId: 'supervisor-2',
          severity: 'warning',
        }),
        expect.objectContaining({
          kind: 'missed-visit',
          marketId: 'market-4',
          severity: 'critical',
        }),
      ]),
    );
  });

  it('should export report rows as CSV', () => {
    const summary = buildShahryarReportSummary(SHAHRYAR_REPORT_SOURCE);
    const csv = buildShahryarReportCsv(summary);

    expect(csv).toContain(
      'Period,Label,Visits,Sales Cartons,Requested Cartons',
    );
    expect(csv).toContain('daily,2026-06-01,2,12,20,250000,10000,0');
    expect(csv).toContain('North Kiosk: High demand and no delivery slot');
  });

  it('should export report rows as Excel XML', () => {
    const summary = buildShahryarReportSummary(SHAHRYAR_REPORT_SOURCE);
    const excelXml = buildShahryarReportExcelXml(summary);

    expect(excelXml).toContain(
      'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"',
    );
    expect(excelXml).toContain('<Worksheet ss:Name="Shahryar Report">');
    expect(excelXml).toContain('<Data ss:Type="String">ماوە</Data>');
    expect(excelXml).toContain('<Data ss:Type="Number">250000</Data>');
  });

  it('should export report rows as a downloadable PDF buffer', () => {
    const summary = buildShahryarReportSummary(SHAHRYAR_REPORT_SOURCE);
    const pdf = buildShahryarReportPdf(summary);

    expect(pdf.subarray(0, 8).toString('utf8')).toBe('%PDF-1.4');
    expect(pdf.toString('utf8')).toContain('Shahryar OPS Report');
    expect(pdf.toString('utf8')).toContain('%%EOF');
  });
});
