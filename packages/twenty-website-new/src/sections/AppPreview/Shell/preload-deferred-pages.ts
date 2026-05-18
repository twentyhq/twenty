const loadSalesDashboardPageModule = () =>
  import('../Pages/Dashboard/SalesDashboardPage');

let deferredPagePreloadPromise: Promise<void> | null = null;

export function preloadDeferredPages() {
  deferredPagePreloadPromise ??= loadSalesDashboardPageModule()
    .then(() => undefined)
    .catch((error: unknown) => {
      deferredPagePreloadPromise = null;

      if (process.env.NODE_ENV !== 'production') {
        console.error('AppPreview deferred page preload failed:', error);
      }
    });

  return deferredPagePreloadPromise;
}
