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
