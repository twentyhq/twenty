const loadSalesDashboardPageModule = () =>
  import('../Pages/Dashboard/SalesDashboardPage');

const loadWorkflowPageModule = () => import('../Pages/Workflow/WorkflowPage');

let deferredPagePreloadPromise: Promise<void> | null = null;

export function preloadDeferredHomeVisualPages() {
  deferredPagePreloadPromise ??= Promise.all([
    loadSalesDashboardPageModule(),
    loadWorkflowPageModule(),
  ])
    .then(() => undefined)
    .catch((error: unknown) => {
      deferredPagePreloadPromise = null;

      if (process.env.NODE_ENV !== 'production') {
        console.error('Home visual deferred page preload failed:', error);
      }
    });

  return deferredPagePreloadPromise;
}
