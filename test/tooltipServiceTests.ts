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
    PointerEventType,
    PointerType,
    pointerEvent
} from "powerbi-visuals-utils-testutils";
import { select, Selection } from "d3-selection";
import powerbi from "powerbi-visuals-api";

// powerbi.visuals
import ISelectionId = powerbi.visuals.ISelectionId;

// powerbi.extensibility
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { TooltipServiceWrapper } from "./../src/tooltipService";

import { DefaultHandleTouchDelay } from "../constants"

describe("TooltipService", () => {
    const handleTouchDelay: number = 10;

    let tooltipService: TooltipServiceWrapper,
        hostVisualTooltip: IMockHostTooltipService,
        onSpy: jasmine.Spy,
        d3Selection: Selection<any, any, any, any>,
        tooltipRoot: HTMLElement,
        element: HTMLElement;

    beforeEach(() => {

        hostVisualTooltip = jasmine.createSpyObj("tooltipService", [
            "show",
            "move",
            "hide",
            "enabled"
        ]);

        hostVisualTooltip.enabled.and.returnValue(true);

        tooltipRoot = testDom("100px", "100px");

        // avoids having to deal with offset mouse coordinates.
        tooltipRoot.style.position = "absolute";
        tooltipRoot.style.top = "0px";
        tooltipRoot.style.left = "0px";

        element = document.createElement("div");
        tooltipRoot.appendChild(element);

        d3Selection = select(element);
        onSpy = spyOn(d3Selection, "on").and.callThrough();

        tooltipService = new TooltipServiceWrapper({
            tooltipService: hostVisualTooltip,
            rootElement: tooltipRoot,
            handleTouchDelay: handleTouchDelay
        });
    });

    describe("addTooltip", () => {
        describe("events", () => {
            let identity: ISelectionId;
            let tooltipData: VisualTooltipDataItem[];
            let getTooltipInfoDelegate: jasmine.Spy;
            let getDataPointIdentity: jasmine.Spy;
            let coordinateX: number = 50;
            let coordinateY: number = 50;

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

            describe("pointerover: ", () => {
                describe("for mouse type device, ", () => {
                    it("shows tooltip", () => {
                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);

                        let selectionId: ISelectionId = getDataPointIdentity(d3Selection.datum());

                        expect(hostVisualTooltip.show).toHaveBeenCalledWith({
                            coordinates: [coordinateX, coordinateY],
                            isTouchEvent: false,
                            dataItems: tooltipData,
                            identities: [selectionId]
                        });
                    });

                    it("calls into visual to get identities and tooltip data", () => {
                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum());
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum());
                    });

                    it("calls into visual even when no data", () => {
                        d3Selection.data([undefined]);

                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum());
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum());
                    });
                })
                describe("for touch type device", () => {
                    it("shows tooltip", (done) => {
                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.touch, coordinateX, coordinateY);

                        let selectionId: ISelectionId = getDataPointIdentity(d3Selection.datum());

                        setTimeout(() => {
                            expect(hostVisualTooltip.show).toHaveBeenCalledWith({
                                coordinates: [coordinateX, coordinateY],
                                isTouchEvent: true,
                                dataItems: tooltipData,
                                identities: [selectionId]
                            });
                            done();
                        }, DefaultHandleTouchDelay);
                    });

                    it("calls into visual to get identities and tooltip data", () => {
                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.touch, coordinateX, coordinateY);

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum());
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum());
                    });

                    it("calls into visual even when no data", () => {
                        d3Selection.data([undefined]);

                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.touch, coordinateX, coordinateY);

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum());
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum());
                    });
                });
            });

            describe("pointermove", () => {
                it("moves tooltip", () => {
                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    let selectionId: ISelectionId = getDataPointIdentity(d3Selection.datum());

                    expect(hostVisualTooltip.move).toHaveBeenCalledWith({
                        coordinates: [coordinateX, coordinateY],
                        isTouchEvent: false,
                        dataItems: undefined,
                        identities: [selectionId]
                    });
                });

                it("calls into visual to get identities", () => {
                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum());
                });

                it("calls into visual to get identities even when no data", () => {
                    d3Selection.data([undefined]);

                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum());
                });

                it("does not reload tooltip data if reloadTooltipDataOnMouseMove is false", () => {
                    // reloadTooltipDataOnMouseMove is false by default
                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(getTooltipInfoDelegate).not.toHaveBeenCalled();
                });

                it("reloads tooltip data if reloadTooltipDataOnMouseMove is true", () => {
                    tooltipService.addTooltip(
                        d3Selection,
                        getTooltipInfoDelegate,
                        getDataPointIdentity,
                        true /* reloadTooltipDataOnMouseMove */
                    );

                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    let selectionId: ISelectionId = getDataPointIdentity(d3Selection.datum());

                    expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum());
                    expect(hostVisualTooltip.move).toHaveBeenCalledWith({
                        coordinates: [coordinateX, coordinateY],
                        isTouchEvent: false,
                        dataItems: tooltipData,
                        identities: [selectionId]
                    });
                });
            });

            describe("pointerout", () => {
                it("hides tooltip", () => {
                    pointerEvent.call(element, element, PointerEventType.pointerout, PointerType.mouse, coordinateX, coordinateY);

                    expect(hostVisualTooltip.hide).toHaveBeenCalledWith({
                        isTouchEvent: false,
                        immediately: false,
                    });
                });
            });


            it("mouseover does show tooltip after touchend delay", (done) => {
                pointerEvent.call(element, element, PointerEventType.pointerout, PointerType.mouse, coordinateX, coordinateY);

                setTimeout(() => {
                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);

                    expect(hostVisualTooltip.show).toHaveBeenCalled();
                    done();
                }, /* slightly more than handleTouchDelay */ 20);
            });
        });

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
