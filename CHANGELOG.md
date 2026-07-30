## 7.0.0

### Breaking changes
* Test runner migrated from Karma + Jasmine to Vitest (browser mode with Playwright headless Chromium).
* Build/development TypeScript upgraded to 6.x.
* Module output paths changed: `lib/index.js` (was `lib/src/index.js`).

### Changed
* `powerbi-visuals-api` updated to ^5.11.0.
* `d3-selection` types updated.
* Source code fixed for TypeScript strict mode.
* `constants.ts` moved into `src/` for proper module structure.
* CI/development baseline updated to Node.js 20.x / 22.x.

### Removed
* Karma, Webpack, Jasmine, ts-loader, coverage-istanbul-loader removed.
* `karma.conf.ts` and `webpack.config.js` deleted.

### Infrastructure
* Lint stack migrated to ESLint 10 flat config (`eslint.config.mjs`).
* CI workflows modernized to `actions/*@v6` and Node 20/22 matrix.
* CodeQL workflow updated to Node 20 and modern action versions.
* Release workflow updated to use `GITHUB_TOKEN` and Playwright install step.
* Added Dependabot configuration for monthly npm and GitHub Actions updates.

## 6.0.5
* Fixed stale tooltip issue: a "move" event is no longer emitted to the host unless a tooltip was previously shown (between "show" and "hide")

## 6.0.4
* powerbi-visuals-api update to 5.9.0

## 6.0.3
* Update powerbi-visuals-utils-testutils to 6.0.3

## 6.0.2
* Vulnerabilities patched
* Packages update
* Update build.yml to use node 18, 20

## 6.0.1
* Packages update
* Removed coveralls

## 6.0.0
* Packages update
* Vulnerabilities patched

## 3.0.0
* Now we use pointer events instead of mouse and touch events; 
* Fixed web and mobile tooltip defenition logic; 
* Fixed mobile tooltip "glitch" issue (fast 'opening - closing - opening' of tooltip on mobile devices);
* Fixed mobile tooltipe coordinates calculation; 
* Migrated to ESlint; 
* Replaced `istanbul-instrumenter-loader` by `coverage-istanbul-loader`;
* Fixed vulnerabilities and updated libs;
* Removed unused libs; 

### **⚠ IMPORTANT CHANGES**
* `rootElement` argument in `createTooltipServiceWrapper` has been deprecated, it is now optional and can be removed completely in the future;

## 2.5.2
* Fixed touchstart/touchend events for iOS devices; 
## 2.5.1
* addToolips fix; 

## 2.5.0
* D3 update / adaptive for v5(or less) and v6 d3 in visuals
* Handle contextMenu on mobile devices

## 2.4.0
* Packages update
* No-jquery tests

## 2.3.1
* Packages update
* No-jquery tests

## 2.3.0
* Tooltiputils doesn't close tooltip on touch end event.

## 2.2.0
* Update packages to fix vulnerabilities
* Update powerbi-visuals-api to 2.6.0
* Update powerbi-visuals-utils-testutils to 2.2.0

## 2.1.3
* Update packages to fix vulnerabilities

## 2.0.3
* Allow to provide custom getEvent method to tooltip service

## 2.0.2
* Convert tooltiputils to es2015 modules

## 1.0.0
* Removed `typings`
* Unified dependencies versions
