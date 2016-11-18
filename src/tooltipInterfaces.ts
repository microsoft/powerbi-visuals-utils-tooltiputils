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
    import Selector = powerbi.data.Selector;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;

    export interface TooltipEventArgs<TData> {
        data: TData;
        coordinates: number[];
        elementCoordinates: number[];
        context: HTMLElement;
        isTouchEvent: boolean;
    }

    export interface VisualTooltipDataItem {
        displayName: string;
        value: string;
        color?: string;
        header?: string;
        opacity?: string;
    }

    export interface VisualTooltipShowEventArgs extends VisualTooltipMoveEventArgs {
        dataItems: VisualTooltipDataItem[];
    }

    export interface VisualTooltipMoveEventArgs {
        coordinates: number[];
        isTouchEvent: boolean;
        dataItems?: VisualTooltipDataItem[];
        identities: Selector[];
    }

    export interface VisualTooltipHideEventArgs {
        isTouchEvent: boolean;
        immediately: boolean;
    }

    export interface IVisualHostTooltipService {
        /** Show a tooltip. */
        show(args: VisualTooltipShowEventArgs): void;

        /** Move a visible tooltip. */
        move(args: VisualTooltipMoveEventArgs): void;

        /** Hide a tooltip. */
        hide(args: VisualTooltipHideEventArgs): void;

        /** Gets the container that tooltip elements will be appended to. */
        container(): Element;

        /** Indicates if tooltips are enabled or not. */
        enabled(): boolean;
    }

    export interface IVisualHostServices extends IVisualHost {
        tooltips?(): IVisualHostTooltipService;
    }
}
