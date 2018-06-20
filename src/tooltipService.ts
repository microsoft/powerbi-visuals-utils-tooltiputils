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

    // powerbi.extensibility
    import ITooltipService = powerbi.extensibility.ITooltipService;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;

    const DefaultHandleTouchDelay = 1000;

    export function createTooltipServiceWrapper(
        tooltipService: ITooltipService,
        rootElement: Element,
        handleTouchDelay: number = DefaultHandleTouchDelay): ITooltipServiceWrapper {

        return new TooltipServiceWrapper(
            tooltipService,
            rootElement,
            handleTouchDelay);
    }

    export class TooltipServiceWrapper implements ITooltipServiceWrapper {
        private handleTouchTimeoutId: number;
        private visualHostTooltipService: ITooltipService;
        private rootElement: Element;
        private handleTouchDelay: number;

        constructor(
            tooltipService: ITooltipService,
            rootElement: Element,
            handleTouchDelay: number = DefaultHandleTouchDelay) {

            this.visualHostTooltipService = tooltipService;
            this.rootElement = rootElement;
            this.handleTouchDelay = handleTouchDelay;
        }


        /*
         * Converts values of VisualTooltipDataItem object to string for prevent passing numbers to Tooltip API of Power BI
         */
        private convertValuesToString(tooltips: VisualTooltipDataItem[]): VisualTooltipDataItem[] {
            return tooltips.map( (tooltip: VisualTooltipDataItem) => {
                tooltip.value = `${tooltip.value}`;
                tooltip.displayName = `${tooltip.displayName}`;
                if (tooltip.color) {
                    tooltip.color = `${tooltip.color}`;
                }
                if (tooltip.opacity) {
                    tooltip.opacity = `${tooltip.opacity}`;
                }
                if (tooltip.header) {
                    tooltip.header = `${tooltip.header}`;
                }
                return tooltip;
            });
        }

        public addTooltip<T>(
            selection: d3.Selection<any>,
            getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
            getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId,
            reloadTooltipDataOnMouseMove?: boolean): void {

            if (!selection || !this.visualHostTooltipService.enabled()) {
                return;
            }

            let rootNode: Element = this.rootElement;

            // Mouse events
            selection.on("mouseover.tooltip", () => {
                // Ignore mouseover while handling touch events
                if (!this.canDisplayTooltip(d3.event)) {
                    return;
                }

                let tooltipEventArgs = this.makeTooltipEventArgs<T>(rootNode, true, false);
                if (!tooltipEventArgs) {
                    return;
                }

                let tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                if (tooltipInfo == null) {
                    return;
                }
                tooltipInfo = this.convertValuesToString(tooltipInfo);

                let selectionIds: ISelectionId[] = this.getSelectionIds<T>(tooltipEventArgs, getDataPointIdentity);

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
                if (!this.canDisplayTooltip(d3.event)) {
                    return;
                }

                let tooltipEventArgs = this.makeTooltipEventArgs<T>(rootNode, true, false);
                if (!tooltipEventArgs) {
                    return;
                }

                let tooltipInfo: VisualTooltipDataItem[];
                if (reloadTooltipDataOnMouseMove) {
                    tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);

                    if (tooltipInfo == null) {
                        return;
                    }
                }

                let selectionIds: ISelectionId[] = this.getSelectionIds<T>(tooltipEventArgs, getDataPointIdentity);

                this.visualHostTooltipService.move({
                    coordinates: tooltipEventArgs.coordinates,
                    isTouchEvent: false,
                    dataItems: tooltipInfo,
                    identities: selectionIds
                });
            });

            // --- Touch events ---

            let touchStartEventName: string = touch.touchStartEventName(),
                touchEndEventName: string = touch.touchEndEventName(),
                isPointerEvent: boolean = touch.usePointerEvents();

            selection.on(touchStartEventName + ".tooltip", () => {
                this.visualHostTooltipService.hide({
                    isTouchEvent: true,
                    immediately: true,
                });

                let tooltipEventArgs = this.makeTooltipEventArgs<T>(rootNode, isPointerEvent, true);
                if (!tooltipEventArgs) {
                    return;
                }

                let tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs),
                    selectionIds: ISelectionId[] = this.getSelectionIds<T>(tooltipEventArgs, getDataPointIdentity);

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
                this.handleTouchTimeoutId = setTimeout(() => {
                    this.handleTouchTimeoutId = undefined;
                }, this.handleTouchDelay);
            });
        }

        private getSelectionIds<T>(
            tooltipEventArgs: TooltipEventArgs<T>,
            getDataPointIdentity: (args: TooltipEventArgs<T>) => ISelectionId): ISelectionId[] {

            const selectionId: ISelectionId = getDataPointIdentity
                ? getDataPointIdentity(tooltipEventArgs)
                : null;

            return selectionId
                ? [selectionId]
                : [];
        }

        public hide(): void {
            this.visualHostTooltipService.hide({ immediately: true, isTouchEvent: false });
        }

        private makeTooltipEventArgs<T>(
            rootNode: Element,
            isPointerEvent: boolean,
            isTouchEvent: boolean): TooltipEventArgs<T> {

            let target = <HTMLElement>(<Event>d3.event).target,
                data: T = d3.select(target).datum();

            let mouseCoordinates: number[] = this.getCoordinates(rootNode, isPointerEvent),
                elementCoordinates: number[] = this.getCoordinates(target, isPointerEvent);

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
            let canDisplay: boolean = true,
                mouseEvent: MouseEvent = <MouseEvent>d3Event;

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

                let rect: ClientRect = rootNode.getBoundingClientRect();

                coordinates = [
                    e.clientX - rect.left - rootNode.clientLeft,
                    e.clientY - rect.top - rootNode.clientTop
                ];
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
