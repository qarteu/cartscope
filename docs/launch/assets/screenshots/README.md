# Chrome Web Store screenshots — Preview 0.1.2

These five **1280 × 800 PNGs** are the current upload set. They were captured in Chrome from the installed `cartscope-launch-0.1.2.zip`, using the labeled sample workspace. The PNGs are copied byte-for-byte from the successful hosted run; they have not been resized, cropped after capture, composited, or retouched.

| Suggested order | Upload file | What is visible |
| --- | --- | --- |
| 1 | [store-cart-1280x800.png](store-cart-1280x800.png) | Saved cart, item budget, and saved product controls |
| 2 | [store-compare-1280x800.png](store-compare-1280x800.png) | Actual checked-offer cards, lowest recorded total, shipping/tax details, and sample labels |
| 3 | [store-alerts-1280x800.png](store-alerts-1280x800.png) | Clearly labeled example restock alert and its observed-change explanation |
| 4 | [store-orders-1280x800.png](store-orders-1280x800.png) | Manual order status, dates, sample-data explanation, and editing controls |
| 5 | [store-settings-1280x800.png](store-settings-1280x800.png) | Local-data explanation, privacy link, export/import controls, sample reset, and feedback links |

These are browser viewport captures, not full-page images. Cart, alerts, and orders start at the top of their views and show **PREVIEW 0.1.2**. Comparison is scrolled in Chrome to show the actual offer costs; Settings is scrolled to show the complete **Your data** card. Those two screenshots do not show the header badge. Sample offer labels and the sample reset control remain visible. No UI or runtime CSS was changed to stage these captures.

## Capture provenance

- **Run:** [43778186951](https://github.com/qarteu/cartscope/actions/runs/43778186951), completed successfully; the browser report finished at **2026-11-16 00:05:49 UTC** (November 15 in Pacific time).
- **Source commit:** `ff47f447ca4c6740db3090db51761570e2f986e9`.
- **Browser:** Chrome for Testing `151.0.7922.34`, automated with Playwright.
- **Surface:** the installed extension's `sidepanel.html` opened in a fresh disposable QA tab at a 1280 × 800 viewport. This is extension code from the packaged ZIP, not the hosted browser demo or an illustration. The centered panel and surrounding background come from the unmodified runtime CSS.
- **Package SHA-256:** `a36de3df01656c062e5000b7bd2fb0a7b46d11d61d11bcb9be5393f7a18d24d0`.
- **Result:** [the browser report](../../evidence/browser-results-0.1.2.json) records 18 checks passed, zero failed, and no uncaught JavaScript errors. [Hosted run metadata](../../evidence/hosted-run.json) records the successful source run.

[The capture manifest](capture-manifest.json) records each PNG's SHA-256, dimensions, capture position, source artifact member, package identity, report hashes, and capture limits. The five documentation copies were compared with the original files under the run's `artifacts/screenshots/` directory. The copied browser report was also compared byte-for-byte with the source artifact.

Sample prices, availability, orders, and tracking information are illustrative. The screenshots do not establish compatibility with every live retailer, a live offer feed, the native side-panel lifecycle, or Chrome Web Store publication/approval. The Store URL remains unverified and is not invented here.

For the separate optional brand illustrations, return to [the Store asset index](../README.md). For the listing copy and submission fields, see [the Store listing draft](../../STORE_LISTING.md).
