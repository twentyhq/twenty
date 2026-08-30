// Linaria evaluates module graphs to compute CSS and resolves `next/link` in
// the RSC environment, which loads the React Server runtime and throws. Link
// contributes no styles, so evaluation gets this stub instead.
module.exports = { __esModule: true, default: () => null };
