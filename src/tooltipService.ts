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
import {
    ITooltipServiceWrapper,
    TooltipIdentityDelegate,
    TooltipInfoDelegate,
    TooltipServiceWrapperOptions
} from "./tooltipInterfaces";
import { Selection, selectAll } from "d3-selection";
import { DefaultHandleTouchDelay } from "./constants";

import powerbi from "powerbi-visuals-api";

// powerbi.extensibility
import ISelectionId = powerbi.extensibility.ISelectionId;
import ITooltipService = powerbi.extensibility.ITooltipService;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import TooltipMoveOptions = powerbi.extensibility.TooltipMoveOptions;
import TooltipShowOptions = powerbi.extensibility.TooltipShowOptions;

export function createTooltipServiceWrapper(
    tooltipService: ITooltipService,
    rootElement?: Element, // this argument is deprecated and is optional now, just to maintain visuals with tooltiputils logic written for versions bellow 3.0.0
    handleTouchDelay: number = DefaultHandleTouchDelay
): ITooltipServiceWrapper {

    return new TooltipServiceWrapper({
        tooltipService: tooltipService,
        handleTouchDelay: handleTouchDelay,
    });
}

export class TooltipServiceWrapper implements ITooltipServiceWrapper {
    private handleTouchTimeoutId: number | undefined;
    private visualHostTooltipService: ITooltipService;
    private handleTouchDelay: number;

    constructor(options: TooltipServiceWrapperOptions) {
        this.visualHostTooltipService = options.tooltipService;
        this.handleTouchDelay = options.handleTouchDelay ?? DefaultHandleTouchDelay;
    }

    public addTooltip<T>(
        selection: Selection<any, any, any, any>,
        getTooltipInfoDelegate: TooltipInfoDelegate<T>,
        getDataPointIdentity?: TooltipIdentityDelegate<T>,
        reloadTooltipDataOnMouseMove?: boolean): void {

        if (!selection || !this.visualHostTooltipService.enabled()) {
            return;
        }

        const internalSelection = selectAll(selection.nodes());

        // Tracks whether a tooltip is currently shown for this subscription.
        // A "move" event must only be emitted between a "show" and a "hide",
        // otherwise the host may reposition/re-show a stale tooltip that this
        // visual never actually displayed (e.g. when tooltips are disabled and
        // getTooltipInfoDelegate returns null).
        let isTooltipShown = false;

        const buildOptions = (event: PointerEvent, tooltipInfo: VisualTooltipDataItem[] | undefined, selectionIds: ISelectionId[]): TooltipMoveOptions => ({
            coordinates: [event.clientX, event.clientY],
            isTouchEvent: event.pointerType === "touch",
            dataItems: tooltipInfo,
            identities: selectionIds
        });

        const showTooltip = (event: PointerEvent, tooltipInfo: VisualTooltipDataItem[], selectionIds: ISelectionId[]): void => {
            const options: TooltipShowOptions = { ...buildOptions(event, tooltipInfo, selectionIds), dataItems: tooltipInfo };
            this.visualHostTooltipService.show(options);
        };

        const moveTooltip = (event: PointerEvent, tooltipInfo: VisualTooltipDataItem[] | undefined, selectionIds: ISelectionId[]): void => {
            this.visualHostTooltipService.move(buildOptions(event, tooltipInfo, selectionIds));
        };

        internalSelection.on("pointerover", (event: PointerEvent, data: unknown) => {
            const tooltipInfo = getTooltipInfoDelegate(data as T, event);
            if (tooltipInfo == null) {
                return;
            }
            const selectionIds: ISelectionId[] = getDataPointIdentity
                ? [getDataPointIdentity(data as T, event)]
                : [];

            if (event.pointerType === "mouse") {
                isTooltipShown = true;
                showTooltip(event, tooltipInfo, selectionIds);
            }
            if (event.pointerType === "touch") {
                this.handleTouchTimeoutId = window.setTimeout(() => {
                    isTooltipShown = true;
                    showTooltip(event, tooltipInfo, selectionIds);
                    this.handleTouchTimeoutId = undefined;
                }, this.handleTouchDelay);
            }
        });

        internalSelection.on("pointerout", (event: PointerEvent) => {
            isTooltipShown = false;
            if (event.pointerType === "mouse") {
                this.visualHostTooltipService.hide({
                    isTouchEvent: false,
                    immediately: false,
                });
            }
            if (event.pointerType === "touch") {
                this.cancelTouchTimeoutEvents();
            }
        });

        internalSelection.on("pointermove", (event: PointerEvent, data: unknown) => {
            if (event.pointerType !== "mouse") {
                return;
            }
            // Do not move a tooltip that was never shown (no preceding "show").
            if (!isTooltipShown) {
                return;
            }
            // Left undefined unless reloaded, so the host keeps the data items from "show".
            let tooltipInfo: VisualTooltipDataItem[] | undefined;
            if (reloadTooltipDataOnMouseMove) {
                const reloadedTooltipInfo = getTooltipInfoDelegate(data as T, event);
                if (reloadedTooltipInfo == null) {
                    return;
                }
                tooltipInfo = reloadedTooltipInfo;
            }
            const selectionIds: ISelectionId[] = getDataPointIdentity
                ? [getDataPointIdentity(data as T, event)]
                : [];
            moveTooltip(event, tooltipInfo, selectionIds);
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

}
