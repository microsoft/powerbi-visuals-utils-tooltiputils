import { select, touches } from "d3";
import * as touch from "./tooltipTouch";
const getEvent = () => require("d3").event;
const DefaultHandleTouchDelay = 1000;
export function createTooltipServiceWrapper(tooltipService, rootElement, handleTouchDelay = DefaultHandleTouchDelay) {
    return new TooltipServiceWrapper(tooltipService, rootElement, handleTouchDelay);
}
export class TooltipServiceWrapper {
    constructor(tooltipService, rootElement, handleTouchDelay = DefaultHandleTouchDelay) {
        this.visualHostTooltipService = tooltipService;
        this.rootElement = rootElement;
        this.handleTouchDelay = handleTouchDelay;
    }
    addTooltip(selection, getTooltipInfoDelegate, getDataPointIdentity, reloadTooltipDataOnMouseMove) {
        if (!selection || !this.visualHostTooltipService.enabled()) {
            return;
        }
        let rootNode = this.rootElement;
        // Mouse events
        selection.on("mouseover.tooltip", () => {
            // Ignore mouseover while handling touch events
            if (!this.canDisplayTooltip(getEvent())) {
                return;
            }
            let tooltipEventArgs = this.makeTooltipEventArgs(rootNode, true, false);
            if (!tooltipEventArgs) {
                return;
            }
            let tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
            if (tooltipInfo == null) {
                return;
            }
            let selectionIds = this.getSelectionIds(tooltipEventArgs, getDataPointIdentity);
            this.visualHostTooltipService.show({
                coordinates: tooltipEventArgs.coordinates,
                isTouchEvent: false,
                dataItems: tooltipInfo,
                identities: selectionIds
            });
        });
        selection.on("mouseout.tooltip", () => {
            this.visualHostTooltipService.hide({
                isTouchEvent: false,
                immediately: false,
            });
        });
        selection.on("mousemove.tooltip", () => {
            // Ignore mousemove while handling touch events
            if (!this.canDisplayTooltip(getEvent())) {
                return;
            }
            let tooltipEventArgs = this.makeTooltipEventArgs(rootNode, true, false);
            if (!tooltipEventArgs) {
                return;
            }
            let tooltipInfo;
            if (reloadTooltipDataOnMouseMove) {
                tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                if (tooltipInfo == null) {
                    return;
                }
            }
            let selectionIds = this.getSelectionIds(tooltipEventArgs, getDataPointIdentity);
            this.visualHostTooltipService.move({
                coordinates: tooltipEventArgs.coordinates,
                isTouchEvent: false,
                dataItems: tooltipInfo,
                identities: selectionIds
            });
        });
        // --- Touch events ---
        let touchStartEventName = touch.touchStartEventName(), touchEndEventName = touch.touchEndEventName(), isPointerEvent = touch.usePointerEvents();
        selection.on(touchStartEventName + ".tooltip", () => {
            this.visualHostTooltipService.hide({
                isTouchEvent: true,
                immediately: true,
            });
            let tooltipEventArgs = this.makeTooltipEventArgs(rootNode, isPointerEvent, true);
            if (!tooltipEventArgs) {
                return;
            }
            let tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs), selectionIds = this.getSelectionIds(tooltipEventArgs, getDataPointIdentity);
            this.visualHostTooltipService.show({
                coordinates: tooltipEventArgs.coordinates,
                isTouchEvent: true,
                dataItems: tooltipInfo,
                identities: selectionIds
            });
        });
        selection.on(touchEndEventName + ".tooltip", () => {
            this.visualHostTooltipService.hide({
                isTouchEvent: true,
                immediately: false,
            });
            if (this.handleTouchTimeoutId) {
                clearTimeout(this.handleTouchTimeoutId);
            }
            // At the end of touch action, set a timeout that will let us ignore the incoming mouse events for a small amount of time
            // TODO: any better way to do this?
            this.handleTouchTimeoutId = window.setTimeout(() => {
                this.handleTouchTimeoutId = undefined;
            }, this.handleTouchDelay);
        });
    }
    getSelectionIds(tooltipEventArgs, getDataPointIdentity) {
        const selectionId = getDataPointIdentity
            ? getDataPointIdentity(tooltipEventArgs)
            : null;
        return selectionId
            ? [selectionId]
            : [];
    }
    hide() {
        this.visualHostTooltipService.hide({ immediately: true, isTouchEvent: false });
    }
    makeTooltipEventArgs(rootNode, isPointerEvent, isTouchEvent) {
        let target = getEvent().target, data = select(target).datum();
        let mouseCoordinates = this.getCoordinates(rootNode, isPointerEvent), elementCoordinates = this.getCoordinates(target, isPointerEvent);
        let tooltipEventArgs = {
            data: data,
            coordinates: mouseCoordinates,
            elementCoordinates: elementCoordinates,
            context: target,
            isTouchEvent: isTouchEvent
        };
        return tooltipEventArgs;
    }
    canDisplayTooltip(d3Event) {
        let canDisplay = true, mouseEvent = d3Event;
        if (mouseEvent.buttons !== undefined) {
            // Check mouse buttons state
            let hasMouseButtonPressed = mouseEvent.buttons !== 0;
            canDisplay = !hasMouseButtonPressed;
        }
        // Make sure we are not ignoring mouse events immediately after touch end.
        canDisplay = canDisplay && (this.handleTouchTimeoutId == null);
        return canDisplay;
    }
    getCoordinates(rootNode, isPointerEvent) {
        let coordinates;
        if (isPointerEvent) {
            // DO NOT USE - WebKit bug in getScreenCTM with nested SVG results in slight negative coordinate shift
            // Also, IE will incorporate transform scale but WebKit does not, forcing us to detect browser and adjust appropriately.
            // Just use non-scaled coordinates for all browsers, and adjust for the transform scale later (see lineChart.findIndex)
            // coordinates = d3.mouse(rootNode);
            // copied from d3_eventSource (which is not exposed)
            let e = event, s;
            while (s = e.sourceEvent)
                e = s;
            let rect = rootNode.getBoundingClientRect();
            coordinates = [
                e.clientX - rect.left - rootNode.clientLeft,
                e.clientY - rect.top - rootNode.clientTop
            ];
        }
        else {
            let touchCoordinates = touches(rootNode);
            if (touchCoordinates && touchCoordinates.length > 0) {
                coordinates = touchCoordinates[0];
            }
        }
        return coordinates;
    }
}
//# sourceMappingURL=tooltipService.js.map