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
    testDom,
    createTouchesList,
    createTouch,
    d3MouseOver,
    d3TouchEnd,
    d3MouseMove,
    d3MouseOut,
    d3TouchStart
} from "powerbi-visuals-utils-testutils";
import { select, Selection } from "d3-selection";
import { TooltipEventArgs } from "./../lib/tooltipInterfaces";
import powerbi from "powerbi-visuals-tools";

// powerbi.visuals
import ISelectionId = powerbi.visuals.ISelectionId;

// powerbi.extensibility
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { TooltipServiceWrapper } from "./../lib/tooltipService";

// powerbi.extensibility.utils.tooltip
// import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
// import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
// import TooltipServiceWrapper = powerbi.extensibility.utils.tooltip.TooltipServiceWrapper;

describe("TooltipService", () => {
    const handleTouchDelay: number = 10;

    let tooltipService: TooltipServiceWrapper,
        hostVisualTooltip: IMockHostTooltipService,
        onSpy: jasmine.Spy,
        d3Selection: Selection<any, any, any, any>,
        tooltipRoot: JQuery,
        element: JQuery;

    beforeEach(() => {
        window["PointerEvent"] = null; // Note: We don't want to use PointerEvent in unit test now. We'll add some extra tests for PointerEvent.

        hostVisualTooltip = jasmine.createSpyObj("tooltipService", [
            "show",
            "move",
            "hide",
            "enabled"
        ]);

        hostVisualTooltip.enabled.and.returnValue(true);

        tooltipRoot = testDom("100px", "100px");

        // avoids having to deal with offset mouse coordinates.
        tooltipRoot.css({
            position: "absolute",
            top: 0,
            left: 0,
        });

        element = $("<div>").appendTo(tooltipRoot);

        d3Selection = select(element.get(0) as any);
        onSpy = spyOn(d3Selection, "on").and.callThrough();

        tooltipService = new TooltipServiceWrapper(
            hostVisualTooltip,
            tooltipRoot.get(0) as any,
            handleTouchDelay);
    });

    describe("addTooltip", () => {
        it("events are added to selection", () => {
            tooltipService.addTooltip(
                d3Selection,
                (args) => [],
                (args) => undefined
            );

            expect(onSpy).toHaveBeenCalledWith("mouseover.tooltip", jasmine.any(Function));
            expect(onSpy).toHaveBeenCalledWith("mouseout.tooltip", jasmine.any(Function));
            expect(onSpy).toHaveBeenCalledWith("mousemove.tooltip", jasmine.any(Function));

            // NOTE: likely to be different under IE
            expect(onSpy).toHaveBeenCalledWith("touchstart.tooltip", jasmine.any(Function));
            expect(onSpy).toHaveBeenCalledWith("touchend.tooltip", jasmine.any(Function));
        });

        it("events are not added if service is disabled", () => {
            hostVisualTooltip.enabled.and.returnValue(false);
            tooltipService.addTooltip(
                d3Selection,
                (args) => [],
                (args) => undefined
            );

            expect(onSpy).not.toHaveBeenCalledWith("mouseover.tooltip", jasmine.any(Function));
            expect(onSpy).not.toHaveBeenCalledWith("mouseout.tooltip", jasmine.any(Function));
            expect(onSpy).not.toHaveBeenCalledWith("mousemove.tooltip", jasmine.any(Function));

            // NOTE: likely to be different under IE
            expect(onSpy).not.toHaveBeenCalledWith("touchstart.tooltip", jasmine.any(Function));
            expect(onSpy).not.toHaveBeenCalledWith("touchend.tooltip", jasmine.any(Function));
        });

        describe("events", () => {
            let identity: ISelectionId;
            let tooltipData: VisualTooltipDataItem[];
            let getTooltipInfoDelegate: jasmine.Spy;
            let getDataPointIdentity: jasmine.Spy;

            beforeEach(() => {
                tooltipData = [{
                    displayName: "group",
                    value: "100",
                }];

                getTooltipInfoDelegate = jasmine.createSpy("getTooltipInfoDelegate", (args) => tooltipData).and.callThrough();
                getDataPointIdentity = jasmine.createSpy("getDataPointIdentity", (args) => identity).and.callThrough();

                tooltipService.addTooltip(
                    d3Selection,
                    getTooltipInfoDelegate,
                    getDataPointIdentity
                );

                d3Selection.data(["datum"]);
            });

            describe("mouseover", () => {
                it("shows tooltip", () => {
                    d3MouseOver.call(element, element, 50, 50);

                    let mouseCoordinates = translateMouseCoordinates(50, 50);

                    expect(hostVisualTooltip.show).toHaveBeenCalledWith({
                        coordinates: mouseCoordinates,
                        isTouchEvent: false,
                        dataItems: tooltipData,
                        identities: []
                    });
                });

                it("calls into visual to get identities and tooltip data", () => {
                    d3MouseOver.call(element, element, 50, 50);

                    let mouseCoordinates = translateMouseCoordinates(50, 50);

                    let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                        data: "datum",
                        coordinates: mouseCoordinates,
                        elementCoordinates: translateMouseCoordinates(50, 50),
                        context: element.get(0) as any,
                        isTouchEvent: false
                    };

                    expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                });

                it("calls into visual even when no data", () => {
                    d3Selection.data([undefined]);

                    d3MouseOver.call(element, element, 50, 50);

                    let mouseCoordinates = translateMouseCoordinates(50, 50);

                    let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                        data: undefined,
                        coordinates: mouseCoordinates,
                        elementCoordinates: translateMouseCoordinates(50, 50),
                        context: element.get(0) as any,
                        isTouchEvent: false
                    };

                    expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                });

                it("does not show tooltip immediately after touchend", () => {
                    d3TouchEnd.call(element);
                    d3MouseOver(element, 50, 50);

                    expect(hostVisualTooltip.show).not.toHaveBeenCalled();
                });
            });

            describe("mousemove", () => {
                it("moves tooltip", () => {
                    d3MouseMove(element, 50, 50);

                    let mouseCoordinates = translateMouseCoordinates(50, 50);

                    expect(hostVisualTooltip.move).toHaveBeenCalledWith({
                        coordinates: mouseCoordinates,
                        isTouchEvent: false,
                        dataItems: undefined,
                        identities: []
                    });
                });

                it("calls into visual to get identities", () => {
                    d3MouseMove(element, 50, 50);

                    let mouseCoordinates = translateMouseCoordinates(50, 50);

                    let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                        data: "datum",
                        coordinates: mouseCoordinates,
                        elementCoordinates: translateMouseCoordinates(50, 50),
                        context: element.get(0) as any,
                        isTouchEvent: false
                    };

                    expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                });

                it("calls into visual to get identities even when no data", () => {
                    d3Selection.data([undefined]);

                    d3MouseMove(element, 50, 50);

                    let mouseCoordinates = translateMouseCoordinates(50, 50);

                    let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                        data: undefined,
                        coordinates: mouseCoordinates,
                        elementCoordinates: translateMouseCoordinates(50, 50),
                        context: element.get(0) as any,
                        isTouchEvent: false
                    };

                    expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                });

                it("does not reload tooltip data if reloadTooltipDataOnMouseMove is false", () => {
                    // reloadTooltipDataOnMouseMove is false by default
                    d3MouseMove(element, 50, 50);

                    expect(getTooltipInfoDelegate).not.toHaveBeenCalled();
                });

                it("reloads tooltip data if reloadTooltipDataOnMouseMove is true", () => {
                    tooltipService.addTooltip(
                        d3Selection,
                        getTooltipInfoDelegate,
                        getDataPointIdentity,
                        true /* reloadTooltipDataOnMouseMove */
                    );

                    d3MouseMove(element, 50, 50);

                    let mouseCoordinates = translateMouseCoordinates(50, 50);

                    let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                        data: "datum",
                        coordinates: mouseCoordinates,
                        elementCoordinates: translateMouseCoordinates(50, 50),
                        context: element.get(0) as any,
                        isTouchEvent: false
                    };

                    expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);

                    expect(hostVisualTooltip.move).toHaveBeenCalledWith({
                        coordinates: mouseCoordinates,
                        isTouchEvent: false,
                        dataItems: tooltipData,
                        identities: []
                    });
                });
            });

            describe("mouseout", () => {
                it("hides tooltip", () => {
                    d3MouseOut(element, 0, 0);

                    expect(hostVisualTooltip.hide).toHaveBeenCalledWith({
                        isTouchEvent: false,
                        immediately: false,
                    });
                });
            });

            describe("touchstart", () => {
                it("shows tooltip", () => {
                    d3TouchStart.call(element, element, createTouchesList([createTouch(50, 50, element, /* id */ 0)]));

                    let touchCoordinates = translateTouchCoordinates(50, 50, 0);
                    delete (<any>touchCoordinates).identifier;

                    expect(hostVisualTooltip.show).toHaveBeenCalledWith({
                        coordinates: touchCoordinates,
                        isTouchEvent: true,
                        dataItems: tooltipData,
                        identities: []
                    });
                });

                it("calls into visual to get identities and tooltip data", () => {
                    d3TouchStart.call(element, element, createTouchesList([createTouch(50, 50, element, /* id */ 0)]));

                    let touchCoordinates = translateTouchCoordinates(50, 50, 0);
                    delete (<any>touchCoordinates).identifier;

                    let elementCoordinates = translateTouchCoordinates(50, 50, 0);
                    delete (<any>elementCoordinates).identifier;

                    let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                        data: "datum",
                        coordinates: touchCoordinates,
                        elementCoordinates: elementCoordinates,
                        context: element.get(0) as any,
                        isTouchEvent: true
                    };

                    expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                });

                it("calls into visual even when no data", () => {
                    d3Selection.data([undefined]);

                    d3TouchStart.call(element, element, createTouchesList([createTouch(50, 50, element, /* id */ 0)]));

                    let touchCoordinates = translateTouchCoordinates(50, 50, 0);
                    delete (<any>touchCoordinates).identifier;

                    let elementCoordinates = translateTouchCoordinates(50, 50, 0);
                    delete (<any>elementCoordinates).identifier;

                    let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                        data: undefined,
                        coordinates: touchCoordinates,
                        elementCoordinates: elementCoordinates,
                        context: element.get(0) as any,
                        isTouchEvent: true
                    };

                    expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                });
            });

            describe("touchend", () => {
                it("hides tooltip", () => {
                    d3TouchEnd.call(element);

                    expect(hostVisualTooltip.hide).toHaveBeenCalledWith({
                        isTouchEvent: true,
                        immediately: false,
                    });
                });
            });

            it("mouseover does show tooltip after touchend delay", (done) => {
                d3TouchEnd.call(element);

                setTimeout(() => {
                    d3MouseOver(element, 50, 50);

                    expect(hostVisualTooltip.show).toHaveBeenCalled();
                    done();
                }, /* slightly more than handleTouchDelay */ 20);
            });
        });

        function translateTouchCoordinates(x: number, y: number, id: number): number[] {
            let coordinates = translateMouseCoordinates(x, y);

            // The touch identifier ends up on the coordinates array.
            (<any>coordinates).identifier = id;

            return coordinates;
        }

        function translateMouseCoordinates(x: number, y: number): number[] {
            return [x, y];
        }
    });

    describe("hide", () => {
        it("calls host tooltip service", () => {
            tooltipService.hide();

            expect(hostVisualTooltip.hide).toHaveBeenCalled();
        });
    });

    interface IMockHostTooltipService {
        show: jasmine.Spy;
        move: jasmine.Spy;
        hide: jasmine.Spy;
        enabled: jasmine.Spy;
    }
});
