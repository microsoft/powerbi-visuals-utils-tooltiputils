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
    rootElement?: Element, // this argument is deprecated and is optional now to maintain visuals with tooltiputils logic for versions bellow 3.0.0 without any changes
    handleTouchDelay: number = DefaultHandleTouchDelay
): ITooltipServiceWrapper {

    return new TooltipServiceWrapper({
        tooltipService: tooltipService,
        handleTouchDelay: handleTouchDelay,
    });
}

export class TooltipServiceWrapper implements ITooltipServiceWrapper {
    private handleTouchTimeoutId: number;
    private visualHostTooltipService: ITooltipService;
    private handleTouchDelay: number;

    constructor(options: TooltipServiceWrapperOptions) {
        this.visualHostTooltipService = options.tooltipService;
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

        let internalSelection = selectAll(selection.nodes());

        let callTooltip = (func: Function, event: PointerEvent, tooltipInfo: VisualTooltipDataItem[], selectionIds: ISelectionId[]): void => {
            let coordinates = [event.clientX, event.clientY];
            func.call(this.visualHostTooltipService, {
                coordinates: coordinates,
                isTouchEvent: event.pointerType === "touch",
                dataItems: tooltipInfo,
                identities: selectionIds
            });
        };

        internalSelection.on("pointerover", (event: PointerEvent, data: T) => {
            let tooltipInfo = getTooltipInfoDelegate(data);
            if (tooltipInfo == null) {
                return;
            }
            let selectionIds: ISelectionId[] = getDataPointIdentity ? [getDataPointIdentity(data)] : [];

            if (event.pointerType === "mouse") {
                callTooltip(this.visualHostTooltipService.show, event, tooltipInfo, selectionIds);
            }
            if (event.pointerType === "touch") {
                this.handleTouchTimeoutId = window.setTimeout(() => {
                    callTooltip(this.visualHostTooltipService.show, event, tooltipInfo, selectionIds);
                    this.handleTouchTimeoutId = undefined;
                }, this.handleTouchDelay);
            }
        });

        internalSelection.on("pointerout", (event: PointerEvent, data: T) => {
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

        internalSelection.on("pointermove", (event: PointerEvent, data: T) => {
            if (event.pointerType === "mouse") {
                let tooltipInfo: VisualTooltipDataItem[];
                if (reloadTooltipDataOnMouseMove) {
                    tooltipInfo = getTooltipInfoDelegate(data);
                    if (tooltipInfo == null) {
                        return;
                    }
                }
                let selectionIds: ISelectionId[] = getDataPointIdentity ? [getDataPointIdentity(data)] : [];
                callTooltip(this.visualHostTooltipService.move, event, tooltipInfo, selectionIds);
            }
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
