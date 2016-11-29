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

module powerbi.extensibility.utils.tooltip {
    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;

    // powerbi.extensibility.utils.svg
    import touch = powerbi.extensibility.utils.svg.touch;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import VisualTooltipDataItem = powerbi.extensibility.utils.tooltip.VisualTooltipDataItem;
    import IVisualHostServices = powerbi.extensibility.utils.tooltip.IVisualHostServices;
    import IVisualHostTooltipService = powerbi.extensibility.utils.tooltip.IVisualHostTooltipService;
    import VisualHostTooltipServiceFallback = powerbi.extensibility.utils.tooltip.VisualHostTooltipServiceFallback;
    import LegacyTooltipService = powerbi.extensibility.utils.tooltip.LegacyTooltipService;

    export interface ITooltipService {
        addTooltip<T>(
            selection: d3.Selection<any>,
            getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
            getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId,
            reloadTooltipDataOnMouseMove?: boolean): void;
        hide(): void;
    }

    export function createTooltipService(hostServices: IVisualHostServices): ITooltipService {
        let visualHostTooltipService: IVisualHostTooltipService;

        if (hostServices && hostServices.tooltips) {
            visualHostTooltipService = hostServices.tooltips();
        }

        if (!visualHostTooltipService && LegacyTooltipService) {
            return new LegacyTooltipService();
        }

        if (!visualHostTooltipService) {
            visualHostTooltipService = new VisualHostTooltipServiceFallback();
        }

        return new TooltipService(visualHostTooltipService);
    }

    const DefaultHandleTouchDelay = 1000;

    export class TooltipService implements ITooltipService {
        private handleTouchTimeoutId: number;
        private visualHostTooltipService: IVisualHostTooltipService;
        private handleTouchDelay: number;

        constructor(visualHostTooltipService: IVisualHostTooltipService, handleTouchDelay: number = DefaultHandleTouchDelay) {
            this.visualHostTooltipService = visualHostTooltipService;
            this.handleTouchDelay = handleTouchDelay;
        }

        public addTooltip<T>(
            selection: d3.Selection<any>,
            getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
            getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId,
            reloadTooltipDataOnMouseMove?: boolean): void {

            if (!this.visualHostTooltipService.enabled()) {
                return;
            }

            let rootNode = this.visualHostTooltipService.container();

            // Mouse events
            selection.on("mouseover.tooltip", () => {
                // Ignore mouseover while handling touch events
                if (!this.canDisplayTooltip(d3.event))
                    return;

                let tooltipEventArgs = this.makeTooltipEventArgs<T>(rootNode, true, false);
                if (!tooltipEventArgs)
                    return;

                let tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                if (tooltipInfo == null)
                    return;

                let selectionId = getDataPointIdentity && getDataPointIdentity(tooltipEventArgs);
                let identity = selectionId && selectionId.getSelectorsByColumn();

                this.visualHostTooltipService.show({
                    coordinates: tooltipEventArgs.coordinates,
                    isTouchEvent: false,
                    dataItems: tooltipInfo,
                    identities: identity ? [identity] : [],
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
                if (!this.canDisplayTooltip(d3.event))
                    return;

                let tooltipEventArgs = this.makeTooltipEventArgs<T>(rootNode, true, false);
                if (!tooltipEventArgs)
                    return;

                let tooltipInfo: VisualTooltipDataItem[];
                if (reloadTooltipDataOnMouseMove) {
                    tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                    if (tooltipInfo == null)
                        return;
                }

                let selectionId = getDataPointIdentity(tooltipEventArgs);
                let identity = selectionId && selectionId.getSelectorsByColumn();

                this.visualHostTooltipService.move({
                    coordinates: tooltipEventArgs.coordinates,
                    isTouchEvent: false,
                    dataItems: tooltipInfo,
                    identities: identity ? [identity] : [],
                });
            });

            // --- Touch events ---

            let touchStartEventName: string = touch.touchStartEventName();
            let touchEndEventName: string = touch.touchEndEventName();
            let isPointerEvent: boolean = touch.usePointerEvents();

            selection.on(touchStartEventName + ".tooltip", () => {
                this.visualHostTooltipService.hide({
                    isTouchEvent: true,
                    immediately: true,
                });

                let tooltipEventArgs = this.makeTooltipEventArgs<T>(rootNode, isPointerEvent, true);
                if (!tooltipEventArgs)
                    return;

                let tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                let selectionId = getDataPointIdentity(tooltipEventArgs);
                let identity = selectionId && selectionId.getSelectorsByColumn();

                this.visualHostTooltipService.show({
                    coordinates: tooltipEventArgs.coordinates,
                    isTouchEvent: true,
                    dataItems: tooltipInfo,
                    identities: identity ? [identity] : [],
                });
            });

            selection.on(touchEndEventName + ".tooltip", () => {
                this.visualHostTooltipService.hide({
                    isTouchEvent: true,
                    immediately: false,
                });

                if (this.handleTouchTimeoutId)
                    clearTimeout(this.handleTouchTimeoutId);

                // At the end of touch action, set a timeout that will let us ignore the incoming mouse events for a small amount of time
                // TODO: any better way to do this?
                this.handleTouchTimeoutId = setTimeout(() => {
                    this.handleTouchTimeoutId = undefined;
                }, this.handleTouchDelay);
            });
        }

        public hide(): void {
            this.visualHostTooltipService.hide({ immediately: true, isTouchEvent: false });
        }

        private makeTooltipEventArgs<T>(rootNode: Element, isPointerEvent: boolean, isTouchEvent: boolean): TooltipEventArgs<T> {
            let target = <HTMLElement>(<Event>d3.event).target;
            let data: T = d3.select(target).datum();

            let mouseCoordinates = this.getCoordinates(rootNode, isPointerEvent);
            let elementCoordinates: number[] = this.getCoordinates(target, isPointerEvent);
            let tooltipEventArgs: TooltipEventArgs<T> = {
                data: data,
                coordinates: mouseCoordinates,
                elementCoordinates: elementCoordinates,
                context: target,
                isTouchEvent: isTouchEvent
            };

            return tooltipEventArgs;
        }

        private canDisplayTooltip(d3Event: any): boolean {
            let canDisplay: boolean = true;
            let mouseEvent: MouseEvent = <MouseEvent>d3Event;
            if (mouseEvent.buttons !== undefined) {
                // Check mouse buttons state
                let hasMouseButtonPressed = mouseEvent.buttons !== 0;
                canDisplay = !hasMouseButtonPressed;
            }

            // Make sure we are not ignoring mouse events immediately after touch end.
            canDisplay = canDisplay && (this.handleTouchTimeoutId == null);

            return canDisplay;
        }

        private getCoordinates(rootNode: Element, isPointerEvent: boolean): number[] {
            let coordinates: number[];

            if (isPointerEvent) {
                // DO NOT USE - WebKit bug in getScreenCTM with nested SVG results in slight negative coordinate shift
                // Also, IE will incorporate transform scale but WebKit does not, forcing us to detect browser and adjust appropriately.
                // Just use non-scaled coordinates for all browsers, and adjust for the transform scale later (see lineChart.findIndex)
                // coordinates = d3.mouse(rootNode);

                // copied from d3_eventSource (which is not exposed)
                let e = <MouseEvent>d3.event, s;
                while (s = (<d3.BaseEvent>e).sourceEvent) e = s;
                let rect = rootNode.getBoundingClientRect();
                coordinates = [e.clientX - rect.left - rootNode.clientLeft, e.clientY - rect.top - rootNode.clientTop];
            }
            else {
                let touchCoordinates = d3.touches(rootNode);
                if (touchCoordinates && touchCoordinates.length > 0) {
                    coordinates = touchCoordinates[0];
                }
            }

            return coordinates;
        }
    }
}
