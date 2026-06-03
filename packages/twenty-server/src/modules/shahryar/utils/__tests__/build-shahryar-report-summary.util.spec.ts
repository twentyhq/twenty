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
    expect(summary.analytics.bestMarkets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'market-1',
          label: 'Center Market',
          value: 12,
          secondaryValue: 1,
        }),
      ]),
    );
    expect(summary.analytics.mostActiveSupervisors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'supervisor-1',
          label: 'Karwan',
          value: 1,
          secondaryValue: 12,
        }),
      ]),
    );
    expect(summary.analytics.districtComparisons).toEqual([
      expect.objectContaining({
        district: 'Unassigned',
        activeMarketCount: 4,
        visitCount: 3,
        salesCartons: 20,
        paidAmount: 430000,
      }),
    ]);
    expect(summary.analytics.salesPaymentTrend).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: '2026-05',
          salesCartons: 8,
          paidAmount: 180000,
        }),
        expect.objectContaining({
          label: '2026-06',
          salesCartons: 12,
          paidAmount: 250000,
        }),
      ]),
    );
    expect(summary.analytics.monthlyGrowth).toEqual({
      currentMonthSalesCartons: 12,
      previousMonthSalesCartons: 8,
      salesGrowthPercent: 50,
      currentMonthPaidAmount: 250000,
      previousMonthPaidAmount: 180000,
      paymentGrowthPercent: 39,
    });
  });

  it('should export report rows as CSV', () => {
    const summary = buildShahryarReportSummary(SHAHRYAR_REPORT_SOURCE);
    const csv = buildShahryarReportCsv(summary);

    expect(csv).toContain('Report Summary');
    expect(csv).toContain(
      'Period,Label,Visits,Sales Cartons,Requested Cartons',
    );
    expect(csv).toContain('daily,2026-06-01,2,12,20,250000,10000,0');
    expect(csv).toContain('Best Markets');
    expect(csv).toContain('Center Market,12,visits,1');
    expect(csv).toContain('District Comparison');
    expect(csv).toContain('North Kiosk: High demand and no delivery slot');
  });

  it('should export report rows as Excel XML', () => {
    const summary = buildShahryarReportSummary(SHAHRYAR_REPORT_SOURCE);
    const excelXml = buildShahryarReportExcelXml(summary);

    expect(excelXml).toContain(
      'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"',
    );
    expect(excelXml).toContain('<Worksheet ss:Name="Shahryar Report">');
    expect(excelXml).toContain('<Worksheet ss:Name="Best Markets">');
    expect(excelXml).toContain('<Worksheet ss:Name="Districts">');
    expect(excelXml).toContain('<Data ss:Type="String">ماوە</Data>');
    expect(excelXml).toContain('<Data ss:Type="String">فرۆشتنی کارتۆن</Data>');
    expect(excelXml).toContain('<Data ss:Type="Number">250000</Data>');
  });

  it('should export report rows as a downloadable PDF buffer', async () => {
    const summary = buildShahryarReportSummary(SHAHRYAR_REPORT_SOURCE);
    const pdf = await buildShahryarReportPdf(summary);

    expect(pdf.subarray(0, 5).toString('utf8')).toBe('%PDF-');
    expect(pdf.byteLength).toBeGreaterThan(5000);
  });
});
