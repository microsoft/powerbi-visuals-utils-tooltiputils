/*
*  Power BI Visualizations
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
import { ITooltipServiceWrapper, TooltipServiceWrapperOptions } from "./tooltipInterfaces";
import { Selection, selectAll, pointers } from "d3-selection";
import * as touch from "./tooltipTouch";


// powerbi.visuals
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

// powerbi.extensibility
import ITooltipService = powerbi.extensibility.ITooltipService;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
const DefaultHandleTouchDelay = 500;

export function createTooltipServiceWrapper(
    tooltipService: ITooltipService,
    rootElement: Element,
    handleTouchDelay: number = DefaultHandleTouchDelay): ITooltipServiceWrapper {

    return new TooltipServiceWrapper({
        tooltipService: tooltipService,
        rootElement: rootElement,
        handleTouchDelay: handleTouchDelay,
    });
}

export class TooltipServiceWrapper implements ITooltipServiceWrapper {
    private handleTouchTimeoutId: number;
    private visualHostTooltipService: ITooltipService;
    private rootElement: Element;
    private handleTouchDelay: number;

    constructor(options: TooltipServiceWrapperOptions) {
        this.visualHostTooltipService = options.tooltipService;
        this.rootElement = options.rootElement;
        this.handleTouchDelay = options.handleTouchDelay;
    }

    public addTooltip<T>(
        selection: Selection<any, any, any, any>,
        getTooltipInfoDelegate: (datapoint: T) => VisualTooltipDataItem[],
        getDataPointIdentity?: (datapoint: T) => ISelectionId,
        reloadTooltipDataOnMouseMove?: boolean): void {

        if (!selection || !this.visualHostTooltipService.enabled()) {
            return;
        }

        let rootNode: Element = this.rootElement;

        let internalSelection = selectAll(selection.nodes());
        // Mouse events
        internalSelection.on("mouseover.tooltip", (event: Event, data: T) => {
            // Ignore mouseover while handling touch events
            if (!this.canDisplayTooltip(event)) {
                return;
            }

            let coordinates = this.getCoordinates(event, rootNode, true);

            let tooltipInfo = getTooltipInfoDelegate(data);
            if (tooltipInfo == null) {
                return;
            }

            let selectionIds: ISelectionId[] = getDataPointIdentity ? [getDataPointIdentity(data)] : [];

            this.visualHostTooltipService.show({
                coordinates: coordinates,
                isTouchEvent: false,
                dataItems: tooltipInfo,
                identities: selectionIds
            });
        });

        internalSelection.on("mouseout.tooltip", (event: Event, data: T) => {
            this.visualHostTooltipService.hide({
                isTouchEvent: false,
                immediately: false,
            });
        });

        internalSelection.on("mousemove.tooltip", (event: Event, data: T) => {
            // Ignore mousemove while handling touch events
            if (!this.canDisplayTooltip(event)) {
                return;
            }

            let coordinates = this.getCoordinates(event, rootNode, true);

            let tooltipInfo: VisualTooltipDataItem[];
            if (reloadTooltipDataOnMouseMove) {
                tooltipInfo = getTooltipInfoDelegate(data);

                if (tooltipInfo == null) {
                    return;
                }
            }

            let selectionIds: ISelectionId[] = getDataPointIdentity ? [getDataPointIdentity(data)] : [];

            this.visualHostTooltipService.move({
                coordinates: coordinates,
                isTouchEvent: false,
                dataItems: tooltipInfo,
                identities: selectionIds
            });
        });

        // --- Touch events ---

        let touchStartEventName: string = touch.touchStartEventName();
        let touchEndEventName: string = touch.touchEndEventName();
        let isPointerEvent: boolean = touch.usePointerEvents();

        internalSelection.on(touchStartEventName + ".tooltip", (event, data: T) => {
            let coordinates = this.getCoordinates(event, rootNode, false);
            let tooltipInfo = getTooltipInfoDelegate(data);
            let selectionIds: ISelectionId[] = getDataPointIdentity ? [getDataPointIdentity(data)] : [];

            this.handleTouchTimeoutId = window.setTimeout(() => {
                this.visualHostTooltipService.show({
                    coordinates: coordinates,
                    isTouchEvent: true,
                    dataItems: tooltipInfo,
                    identities: selectionIds
                });
                this.handleTouchTimeoutId = undefined;
            }, this.handleTouchDelay);
        });

        internalSelection.on(touchEndEventName + ".tooltip", () => {
            this.cancelTouchTimeoutEvents();
        });
    }

    public cancelTouchTimeoutEvents() {
        if (this.handleTouchTimeoutId) {
            clearTimeout(this.handleTouchTimeoutId);
        }
    }

    public hide(): void {
        this.visualHostTooltipService.hide({ immediately: true, isTouchEvent: false });
    }

    private canDisplayTooltip(event): boolean {
        let canDisplay: boolean = true;
        const mouseEvent: MouseEvent = event;

        if (mouseEvent.buttons !== undefined) {
            // Check mouse buttons state
            let hasMouseButtonPressed = mouseEvent.buttons !== 0;
            canDisplay = !hasMouseButtonPressed;
        }

        // Make sure we are not ignoring mouse events immediately after touch end.
        canDisplay = canDisplay && (this.handleTouchTimeoutId == null);

        return canDisplay;
    }

    private getCoordinates(event, rootNode: Element, isPointerEvent: boolean): number[] {
        let coordinates: number[];

        if (isPointerEvent) {
            // DO NOT USE - WebKit bug in getScreenCTM with nested SVG results in slight negative coordinate shift
            // Also, IE will incorporate transform scale but WebKit does not, forcing us to detect browser and adjust appropriately.
            // Just use non-scaled coordinates for all browsers, and adjust for the transform scale later (see lineChart.findIndex)
            // coordinates = d3.mouse(rootNode);

            // copied from d3_eventSource (which is not exposed)
            let e = <MouseEvent>event, s;

            while (s = (<any>e).sourceEvent) e = s;

            let rect: ClientRect = rootNode.getBoundingClientRect();

            coordinates = [
                e.clientX - rect.left - rootNode.clientLeft,
                e.clientY - rect.top - rootNode.clientTop
            ];
        }
        else {
            let touchCoordinates = pointers(event);

            if (touchCoordinates && touchCoordinates.length > 0) {
                coordinates = touchCoordinates[0];
            }
        }

        return coordinates;
    }
}
