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
    // powerbi
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewValueColumn = powerbi.DataViewValueColumn;

    // powerbi.extensibility.utils.svg
    import touch = powerbi.extensibility.utils.svg.touch;
    import getCoordinates = powerbi.extensibility.utils.svg.getCoordinates;
    import Point = powerbi.extensibility.utils.svg.touch.Point;
    import Rectangle = powerbi.extensibility.utils.svg.touch.Rectangle;
    import IRect = powerbi.extensibility.utils.svg.IRect;
    import Rect = powerbi.extensibility.utils.svg.Rect;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import VisualTooltipDataItem = powerbi.extensibility.utils.tooltip.VisualTooltipDataItem;

    export interface TooltipDataItem {
        displayName: string;
        value: string;
        color?: string;
        header?: string;
        opacity?: string;
    }

    export interface TooltipOptions {
        opacity: number;
        animationDuration: number;
        offsetX: number;
        offsetY: number;
    }

    export interface TooltipEnabledDataPoint {
        tooltipInfo?: TooltipDataItem[];
    }

    export interface TooltipCategoryDataItem {
        value?: any;
        metadata: DataViewMetadataColumn[];
    }

    export interface TooltipSeriesDataItem {
        value?: any;
        highlightedValue?: any;
        metadata: DataViewValueColumn;
    }

    export interface TooltipLocalizationOptions {
        highlightedValueDisplayName: string;
    }

    export type TooltipEvent = TooltipEventArgs<any>;

    export const enum ScreenQuadrant {
        TopLeft,
        TopRight,
        BottomRight,
        BottomLeft
    };

    const ContainerClassName: ClassAndSelector = createClassAndSelector("tooltip-container");
    const ContentContainerClassName: ClassAndSelector = createClassAndSelector("tooltip-content-container");
    const ArrowClassName: ClassAndSelector = createClassAndSelector("arrow");
    const TooltipHeaderClassName: ClassAndSelector = createClassAndSelector("tooltip-header");
    const TooltipRowClassName: ClassAndSelector = createClassAndSelector("tooltip-row");
    const TooltipColorCellClassName: ClassAndSelector = createClassAndSelector("tooltip-color-cell");
    const TooltipTitleCellClassName: ClassAndSelector = createClassAndSelector("tooltip-title-cell");
    const TooltipValueCellClassName: ClassAndSelector = createClassAndSelector("tooltip-value-cell");

    export interface ITooltipContainer {
        isVisible(): boolean;
        setTestScreenSize(width: number, height: number): void;
        show(tooltipData?: VisualTooltipDataItem[], clickedArea?: IRect): void;
        move(tooltipData: VisualTooltipDataItem[], clickedArea: IRect): void;
        hide(): void;
    }

    export class TooltipContainer implements ITooltipContainer {
        private options: TooltipOptions;
        private rootElement: Element;
        private tooltipContainer: d3.Selection<any>;
        private isTooltipVisible: boolean = false;
        private currentContent: VisualTooltipDataItem[];

        private customScreenWidth: number;
        private customScreenHeight: number;

        constructor(rootElement: Element, options: TooltipOptions) {
            this.options = options;
            this.rootElement = rootElement;
        }

        public isVisible(): boolean {
            return this.isTooltipVisible;
        }

        /** Note: For tests only */
        public setTestScreenSize(width: number, height: number) {
            this.customScreenWidth = width;
            this.customScreenHeight = height;
        }

        public show(tooltipData?: VisualTooltipDataItem[], clickedArea?: IRect) {
            this.isTooltipVisible = true;

            if (!this.tooltipContainer) {
                this.tooltipContainer = this.createTooltipContainer(this.rootElement);
            }

            if (tooltipData) {
                this.setTooltipContent(tooltipData);
            }

            // sets display to the default (found in powerbi-visuals.css), which is flex
            this.tooltipContainer
                .style("display", "")
                .transition()
                .duration(0) // Cancel previous transitions
                .style("opacity", this.options.opacity);

            if (clickedArea) {
                this.setPosition(clickedArea);
            }
        }

        public move(tooltipData: VisualTooltipDataItem[], clickedArea: IRect) {
            if (!this.tooltipContainer) {
                this.tooltipContainer = this.createTooltipContainer(this.rootElement);
            }

            if (tooltipData) {
                this.setTooltipContent(tooltipData);
            }

            this.setPosition(clickedArea);
        }

        public hide() {
            if (this.isTooltipVisible) {
                this.isTooltipVisible = false;
                this.tooltipContainer
                    .transition()
                    .duration(this.options.animationDuration)
                    .style("opacity", 0)
                    .each("end", function () { this.style.display = "none"; });
            }
        }

        private createTooltipContainer(root: Element): d3.Selection<any> {
            let container: d3.Selection<any> = d3.select(root)
                .append("div")
                .attr("class", ContainerClassName.class);

            container.append("div").attr("class", ArrowClassName.class);
            container.append("div").attr("class", ContentContainerClassName.class);
            container.style("display", "none");

            return container;
        }

        private setTooltipContent(tooltipData: VisualTooltipDataItem[]): void {
            if (_.isEqual(tooltipData, this.currentContent))
                return;
            this.currentContent = tooltipData;

            let rowsSelector: string = TooltipRowClassName.selector;
            let contentContainer = this.tooltipContainer.select(ContentContainerClassName.selector);

            // Clear existing content
            contentContainer.selectAll(TooltipHeaderClassName.selector).remove();
            contentContainer.selectAll(TooltipRowClassName.selector).remove();

            if (tooltipData.length === 0) return;

            if (tooltipData[0].header) {
                contentContainer.append("div").attr("class", TooltipHeaderClassName.class).text(tooltipData[0].header);
            }
            let tooltipRow: d3.selection.Update<any> = contentContainer.selectAll(rowsSelector).data(tooltipData);
            let newRow: d3.Selection<any> = tooltipRow.enter().append("div").attr("class", TooltipRowClassName.class);
            if (_.some(tooltipData, (tooltipItem) => tooltipItem.color)) {
                let newColorCell: d3.Selection<any> = newRow.filter((d) => d.color).append("div").attr("class", TooltipColorCellClassName.class);

                newColorCell
                    .append("svg")
                    .attr({
                        "width": "100%",
                        "height": "15px"
                    })
                    .append("circle")
                    .attr({
                        "cx": "5",
                        "cy": "8",
                        "r": "5"
                    })
                    .style({
                        "fill": (d: VisualTooltipDataItem) => d.color,
                        "fill-opacity": (d: VisualTooltipDataItem) => d.opacity != null ? d.opacity : 1,
                    });
            }
            let newTitleCell: d3.Selection<any> = newRow.append("div").attr("class", TooltipTitleCellClassName.class);
            let newValueCell: d3.Selection<any> = newRow.append("div").attr("class", TooltipValueCellClassName.class);

            newTitleCell.text(function (d: VisualTooltipDataItem) { return d.displayName; });
            newValueCell.text(function (d: VisualTooltipDataItem) { return d.value; });
        }

        private getTooltipContainerBounds(): ClientRect {
            let tooltipContainerBounds: ClientRect;

            if (this.tooltipContainer.style("display") === "none") {
                this.tooltipContainer.style("display", "");
                tooltipContainerBounds = (<Element>this.tooltipContainer.node()).getBoundingClientRect();
                this.tooltipContainer.style("display", "none");
            } else {
                tooltipContainerBounds = (<Element>this.tooltipContainer.node()).getBoundingClientRect();
            }

            return tooltipContainerBounds;
        }

        private getTooltipPosition(clickedArea: IRect, clickedScreenArea: ScreenQuadrant): Point {
            let tooltipContainerBounds: ClientRect = this.getTooltipContainerBounds();
            let centerPointOffset: number = Math.floor(clickedArea.width / 2);
            let offsetX: number = 0;
            let offsetY: number = 0;
            let centerPoint: Point = new Point(clickedArea.left + centerPointOffset, clickedArea.top + centerPointOffset);
            let arrowOffset: number = 7;

            if (clickedScreenArea === ScreenQuadrant.TopLeft) {
                offsetX += 3 * arrowOffset + centerPointOffset;
                offsetY -= 2 * arrowOffset + centerPointOffset;
            }
            else if (clickedScreenArea === ScreenQuadrant.TopRight) {
                offsetX -= (2 * arrowOffset + tooltipContainerBounds.width + centerPointOffset);
                offsetY -= 2 * arrowOffset + centerPointOffset;
            }
            else if (clickedScreenArea === ScreenQuadrant.BottomLeft) {
                offsetX += 3 * arrowOffset + centerPointOffset;
                offsetY -= (tooltipContainerBounds.height - 2 * arrowOffset + centerPointOffset);
            }
            else if (clickedScreenArea === ScreenQuadrant.BottomRight) {
                offsetX -= (2 * arrowOffset + tooltipContainerBounds.width + centerPointOffset);
                offsetY -= (tooltipContainerBounds.height - 2 * arrowOffset + centerPointOffset);
            }

            centerPoint.offset(offsetX, offsetY);

            return centerPoint;
        }

        private setPosition(clickedArea: IRect): void {
            let clickedScreenArea: ScreenQuadrant = this.getClickedScreenArea(clickedArea);
            let tooltipPosition: Point = this.getTooltipPosition(clickedArea, clickedScreenArea);
            this.setTooltipContainerClass(clickedScreenArea);
            this.tooltipContainer.style({ "left": tooltipPosition.x + "px", "top": tooltipPosition.y + "px" });

            this.setArrowPosition(clickedScreenArea);
        }

        private setTooltipContainerClass(clickedScreenArea: ScreenQuadrant): void {
            let tooltipContainerClassName: string;
            switch (clickedScreenArea) {
                case ScreenQuadrant.TopLeft:
                case ScreenQuadrant.BottomLeft:
                    tooltipContainerClassName = "left";
                    break;
                case ScreenQuadrant.TopRight:
                case ScreenQuadrant.BottomRight:
                    tooltipContainerClassName = "right";
                    break;
            }
            this.tooltipContainer
                .attr("class", ContainerClassName.class) // Reset all classes
                .classed(tooltipContainerClassName, true);
        }

        private setArrowPosition(clickedScreenArea: ScreenQuadrant): void {
            let arrow: d3.Selection<any> = this.getArrowElement();
            let arrowClassName: string;

            if (clickedScreenArea === ScreenQuadrant.TopLeft) {
                arrowClassName = "top left";
            }
            else if (clickedScreenArea === ScreenQuadrant.TopRight) {
                arrowClassName = "top right";
            }
            else if (clickedScreenArea === ScreenQuadrant.BottomLeft) {
                arrowClassName = "bottom left";
            }
            else {
                arrowClassName = "bottom right";
            }

            arrow
                .attr("class", "arrow") // Reset all classes
                .classed(arrowClassName, true);
        }

        private getArrowElement(): d3.Selection<any> {
            return this.tooltipContainer.select(ArrowClassName.selector);
        }

        private getClickedScreenArea(clickedArea: IRect): ScreenQuadrant {
            /*
             * We use this construction below in order to avoid the following exception in Microsoft Edge and Mozilla Firefox: "'get innerWidth' called on an object that does not implement interface Window".
             * Power BI creates a fake of the window object, so these browsers throw that exception.
             */
            let currentWindow: Window = window.window && window !== window.window
                ? window.window
                : window;

            let screenWidth: number = this.customScreenWidth || currentWindow.innerWidth;
            let screenHeight: number = this.customScreenHeight || currentWindow.innerHeight;
            let centerPointOffset: number = clickedArea.width / 2;
            let centerPoint: Point = new Point(clickedArea.left + centerPointOffset, clickedArea.top + centerPointOffset);
            let halfWidth: number = screenWidth / 2;
            let halfHeight: number = screenHeight / 2;

            if (centerPoint.x < halfWidth && centerPoint.y < halfHeight) {
                return ScreenQuadrant.TopLeft;
            }
            else if (centerPoint.x >= halfWidth && centerPoint.y < halfHeight) {
                return ScreenQuadrant.TopRight;
            }
            else if (centerPoint.x < halfWidth && centerPoint.y >= halfHeight) {
                return ScreenQuadrant.BottomLeft;
            }
            else if (centerPoint.x >= halfWidth && centerPoint.y >= halfHeight) {
                return ScreenQuadrant.BottomRight;
            }
        }
    }

    /**
     * Legacy tooltip component. Please use the tooltip host service instead.
     */
    export class ToolTipComponent {
        public static DefaultTooltipOptions: TooltipOptions = {
            opacity: 1,
            animationDuration: 250,
            offsetX: 10,
            offsetY: 10
        };

        public static parentContainerSelector: string = ".visual";
        public static highlightedValueDisplayNameResorceKey: string = "Tooltip_HighlightedValueDisplayName";
        public static localizationOptions: TooltipLocalizationOptions;

        private tooltipContainer: TooltipContainer;

        constructor(public tooltipOptions?: TooltipOptions) {
            if (!tooltipOptions) {
                this.tooltipOptions = ToolTipComponent.DefaultTooltipOptions;
            }

            // NOTE: This will be called statically by the TooltipManager, thus we need to defer creation of the tooltip container until we actually have a root element.
        }

        public isTooltipComponentVisible(): boolean {
            return this.tooltipContainer && this.tooltipContainer.isVisible();
        }

        public show(tooltipData: TooltipDataItem[], clickedArea: Rectangle) {
            this.ensureTooltipContainer();
            this.tooltipContainer.show(tooltipData, this.convertRect(clickedArea));
        }

        public move(tooltipData: TooltipDataItem[], clickedArea: Rectangle) {
            this.ensureTooltipContainer();
            this.tooltipContainer.move(tooltipData, this.convertRect(clickedArea));
        }

        public hide() {
            this.ensureTooltipContainer();
            this.tooltipContainer.hide();
        }

        private convertRect(rect: Rectangle): IRect {
            return new Rect(rect.x, rect.y, rect.width, rect.height);
        }

        private ensureTooltipContainer(): void {
            if (!this.tooltipContainer) {
                let root = d3.select(ToolTipComponent.parentContainerSelector).node() as Element;
                this.tooltipContainer = new TooltipContainer(root, this.tooltipOptions);
            }
        }
    }

    /**
     * Legacy tooltip management API. Please use the tooltip host service instead.
     */
    export module tooltipManager {
        let GlobalTooltipEventsAttached: boolean = false;
        export let ShowTooltips: boolean = true;
        export let ToolTipInstance: ToolTipComponent = new ToolTipComponent();
        export let tooltipMouseOverDelay: number = 350;
        export let tooltipMouseOutDelay: number = 500;
        export let tooltipTouchDelay: number = 350;
        export let handleTouchDelay: number = 1000;
        let tooltipTimeoutId: number;
        let handleTouchTimeoutId: number = 0;
        let mouseCoordinates: number[];
        let tooltipData: TooltipDataItem[];

        export function addTooltip(
            selection: d3.Selection<any>,
            getTooltipInfoDelegate: (tooltipEvent: TooltipEvent) => TooltipDataItem[],
            reloadTooltipDataOnMouseMove?: boolean,
            onMouseOutDelegate?: () => void): void {

            if (!ShowTooltips) {
                return;
            }

            let rootNode = d3.select(ToolTipComponent.parentContainerSelector).node() as Element;

            // Mouse events
            selection.on("mouseover.tooltip", () => {
                let target = <HTMLElement>(<MouseEvent>d3.event).target;
                let data = d3.select(target).datum();

                // Ignore mouseover while handling touch events
                if (handleTouchTimeoutId || !canDisplayTooltip(d3.event))
                    return;

                mouseCoordinates = getCoordinates(rootNode, true);
                let elementCoordinates: number[] = getCoordinates(target, true);
                let tooltipEvent: TooltipEvent = {
                    data: data,
                    coordinates: mouseCoordinates,
                    elementCoordinates: elementCoordinates,
                    context: target,
                    isTouchEvent: false
                };

                clearTooltipTimeout();

                // if it is already visible, change contents immediately (use 16ms minimum perceivable frame rate to prevent thrashing)
                let delay = ToolTipInstance.isTooltipComponentVisible() ? 16 : tooltipMouseOverDelay;
                tooltipTimeoutId = showDelayedTooltip(tooltipEvent, getTooltipInfoDelegate, delay);
            });

            selection.on("mouseout.tooltip", () => {
                if (!handleTouchTimeoutId) {
                    clearTooltipTimeout();
                    tooltipTimeoutId = hideDelayedTooltip();
                }

                if (onMouseOutDelegate) {
                    onMouseOutDelegate();
                }
            });

            selection.on("mousemove.tooltip", () => {
                let target = <HTMLElement>(<MouseEvent>d3.event).target;
                let data = d3.select(target).datum();

                // Ignore mousemove while handling touch events
                if (handleTouchTimeoutId || !canDisplayTooltip(d3.event))
                    return;

                mouseCoordinates = getCoordinates(rootNode, true);
                let elementCoordinates: number[] = getCoordinates(target, true);
                let tooltipEvent: TooltipEvent = {
                    data: data,
                    coordinates: mouseCoordinates,
                    elementCoordinates: elementCoordinates,
                    context: target,
                    isTouchEvent: false
                };

                moveTooltipEventHandler(tooltipEvent, getTooltipInfoDelegate, reloadTooltipDataOnMouseMove);
            });

            // --- Touch events ---

            // TODO: static?
            let touchStartEventName: string = getTouchStartEventName();
            let touchEndEventName: string = getTouchEndEventName();
            let isPointerEvent: boolean = touchStartEventName === "pointerdown" || touchStartEventName === "MSPointerDown";

            if (!GlobalTooltipEventsAttached) {
                // Add root container hide tooltip event
                attachGlobalEvents(touchStartEventName);
                GlobalTooltipEventsAttached = true;
            }

            selection.on(touchStartEventName, () => {
                let target = <HTMLElement>(<MouseEvent>d3.event).target;
                let data = d3.select(target).datum();

                hideTooltipEventHandler();
                let coordinates: number[] = getCoordinates(rootNode, isPointerEvent);
                let elementCoordinates: number[] = getCoordinates(target, isPointerEvent);
                let tooltipEvent: TooltipEvent = {
                    data: data,
                    coordinates: coordinates,
                    elementCoordinates: elementCoordinates,
                    context: target,
                    isTouchEvent: true
                };
                clearTooltipTimeout();
                tooltipTimeoutId = showDelayedTooltip(tooltipEvent, getTooltipInfoDelegate, tooltipTouchDelay);
            });

            selection.on(touchEndEventName, () => {

                clearTooltipTimeout();
                if (handleTouchTimeoutId)
                    clearTimeout(handleTouchTimeoutId);

                // At the end of touch action, set a timeout that will let us ignore the incoming mouse events for a small amount of time
                handleTouchTimeoutId = setTimeout(() => {
                    handleTouchTimeoutId = 0;
                }, handleTouchDelay);
            });
        }

        function showDelayedTooltip(tooltipEvent: TooltipEvent, getTooltipInfoDelegate: (tooltipEvent: TooltipEvent) => TooltipDataItem[], delayInMs: number): number {
            return setTimeout(() => showTooltipEventHandler(tooltipEvent, getTooltipInfoDelegate), delayInMs);
        }

        function hideDelayedTooltip(): number {
            return setTimeout(() => hideTooltipEventHandler(), tooltipMouseOutDelay);
        }

        export function setLocalizedStrings(localizationOptions: TooltipLocalizationOptions): void {
            ToolTipComponent.localizationOptions = localizationOptions;
        }

        function showTooltipEventHandler(tooltipEvent: TooltipEvent, getTooltipInfoDelegate: (tooltipEvent: TooltipEvent) => TooltipDataItem[]) {
            let tooltipInfo: TooltipDataItem[] = tooltipData || getTooltipInfoDelegate(tooltipEvent);
            if (!_.isEmpty(tooltipInfo)) {
                let coordinates: number[] = mouseCoordinates || tooltipEvent.coordinates;
                let clickedArea = getClickedArea(coordinates[0], coordinates[1], tooltipEvent.isTouchEvent);
                ToolTipInstance.show(tooltipInfo, clickedArea);
            }
        }

        function moveTooltipEventHandler(tooltipEvent: TooltipEvent, getTooltipInfoDelegate: (tooltipEvent: TooltipEvent) => TooltipDataItem[], reloadTooltipDataOnMouseMove: boolean) {
            tooltipData = undefined;
            if (reloadTooltipDataOnMouseMove) {
                tooltipData = getTooltipInfoDelegate(tooltipEvent);
            }
            let clickedArea = getClickedArea(tooltipEvent.coordinates[0], tooltipEvent.coordinates[1], tooltipEvent.isTouchEvent);
            ToolTipInstance.move(tooltipData, clickedArea);
        };

        function hideTooltipEventHandler() {
            ToolTipInstance.hide();
        };

        function clearTooltipTimeout() {
            if (tooltipTimeoutId) {
                clearTimeout(tooltipTimeoutId);
            }
        }

        function canDisplayTooltip(d3Event: any): boolean {
            let cadDisplay: boolean = true;
            let mouseEvent: MouseEvent = <MouseEvent>d3Event;
            if (mouseEvent.buttons !== undefined) {
                // Check mouse buttons state
                let hasMouseButtonPressed = mouseEvent.buttons !== 0;
                cadDisplay = !hasMouseButtonPressed;
            }
            return cadDisplay;
        }

        function getTouchStartEventName(): string {
            let eventName: string = "touchstart";

            if (window["PointerEvent"]) {
                // IE11
                eventName = "pointerdown";
            } else if (window["MSPointerEvent"]) {
                // IE10
                eventName = "MSPointerDown";
            }

            return eventName;
        }

        function getTouchEndEventName(): string {
            let eventName: string = "touchend";

            if (window["PointerEvent"]) {
                // IE11
                eventName = "pointerup";
            } else if (window["MSPointerEvent"]) {
                // IE10
                eventName = "MSPointerUp";
            }

            return eventName;
        }

        function attachGlobalEvents(touchStartEventName: string): void {
            d3.select(ToolTipComponent.parentContainerSelector).on(touchStartEventName, function (d, i) {
                ToolTipInstance.hide();
            });
        }

        function getClickedArea(x: number, y: number, isTouchEvent: boolean): Rectangle {
            let width: number = 0;
            let pointX: number = x;
            let pointY: number = y;

            if (isTouchEvent) {
                width = 12;
                let offset: number = width / 2;
                pointX = Math.max(x - offset, 0);
                pointY = Math.max(y - offset, 0);
            }

            return new Rectangle(pointX, pointY, width, width);
        }
    }

}
