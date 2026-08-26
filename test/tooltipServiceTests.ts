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

import { vi, type Mock } from "vitest";
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
import ITooltipService = powerbi.extensibility.ITooltipService;

import { TooltipServiceWrapper } from "../src/tooltipService";

import { DefaultHandleTouchDelay } from "../src/constants";

interface IMockHostTooltipService extends ITooltipService {
    show: Mock<ITooltipService["show"]>;
    move: Mock<ITooltipService["move"]>;
    hide: Mock<ITooltipService["hide"]>;
    enabled: Mock<ITooltipService["enabled"]>;
}

describe("TooltipService", () => {
    const handleTouchDelay: number = 10;

    let tooltipService: TooltipServiceWrapper,
        hostVisualTooltip: IMockHostTooltipService,
        d3Selection: Selection<any, any, any, any>,
        tooltipRoot: HTMLElement,
        element: HTMLElement;

    beforeEach(() => {

        hostVisualTooltip = {
            show: vi.fn<ITooltipService["show"]>(),
            move: vi.fn<ITooltipService["move"]>(),
            hide: vi.fn<ITooltipService["hide"]>(),
            enabled: vi.fn<ITooltipService["enabled"]>().mockReturnValue(true)
        };

        tooltipRoot = testDom("100px", "100px");

        // avoids having to deal with offset mouse coordinates.
        tooltipRoot.style.position = "absolute";
        tooltipRoot.style.top = "0px";
        tooltipRoot.style.left = "0px";

        element = document.createElement("div");
        tooltipRoot.appendChild(element);

        d3Selection = select(element);

        tooltipService = new TooltipServiceWrapper({
            tooltipService: hostVisualTooltip,
            rootElement: tooltipRoot,
            handleTouchDelay: handleTouchDelay
        });
    });

    describe("addTooltip", () => {
        describe("events", () => {
            const identity: ISelectionId = {
                equals: () => true,
                includes: () => true,
                getKey: () => "mock-selection-id",
                getSelector: () => ({}),
                getSelectorsByColumn: () => ({}),
                hasIdentity: () => true
            };
            let tooltipData: VisualTooltipDataItem[];
            let getTooltipInfoDelegate: Mock<(args: any, event?: PointerEvent) => VisualTooltipDataItem[]>;
            let getDataPointIdentity: Mock<(args: any, event?: PointerEvent) => ISelectionId>;
            let coordinateX: number = 50;
            let coordinateY: number = 50;

            beforeEach(() => {
                tooltipData = [{
                    displayName: "group",
                    value: "100",
                }];

                getTooltipInfoDelegate = vi.fn((_args: any, _event?: PointerEvent) => tooltipData);
                getDataPointIdentity = vi.fn((_args: any, _event?: PointerEvent) => identity);

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

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                        expect(getTooltipInfoDelegate.mock.calls[0][1]).toBe(getDataPointIdentity.mock.calls[0][1]);
                    });

                    it("calls into visual even when no data", () => {
                        d3Selection.data([undefined]);

                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                    });
                });
                describe("for touch type device", () => {
                    it("shows tooltip", async () => {
                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.touch, coordinateX, coordinateY);

                        let selectionId: ISelectionId = getDataPointIdentity(d3Selection.datum());

                        await new Promise(resolve => setTimeout(resolve, /* slightly more than handleTouchDelay */ 20));

                        expect(hostVisualTooltip.show).toHaveBeenCalledWith({
                            coordinates: [coordinateX, coordinateY],
                            isTouchEvent: true,
                            dataItems: tooltipData,
                            identities: [selectionId]
                        });
                    });

                    it("calls into visual to get identities and tooltip data", () => {
                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.touch, coordinateX, coordinateY);

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                    });

                    it("calls into visual even when no data", () => {
                        d3Selection.data([undefined]);

                        pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.touch, coordinateX, coordinateY);

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                        expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                    });
                });
            });

            describe("pointermove", () => {
                it("moves tooltip", () => {
                    // A tooltip can only be moved after it was shown (pointerover).
                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);
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
                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);
                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                });

                it("calls into visual to get identities even when no data", () => {
                    d3Selection.data([undefined]);

                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);
                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(getDataPointIdentity).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                });

                it("does not move tooltip without a preceding pointerover (show)", () => {
                    // Regression: a "move" must not be emitted if no "show" happened.
                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(hostVisualTooltip.move).not.toHaveBeenCalled();
                });

                it("does not show or move tooltip when tooltip data is null (tooltips disabled)", () => {
                    // Regression for stale-tooltip bug: when the visual returns no
                    // tooltip data, neither "show" nor "move" must reach the host.
                    getTooltipInfoDelegate.mockReturnValue(null as unknown as VisualTooltipDataItem[]);

                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);
                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(hostVisualTooltip.show).not.toHaveBeenCalled();
                    expect(hostVisualTooltip.move).not.toHaveBeenCalled();
                });

                it("stops moving tooltip after pointerout (hide)", () => {
                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);
                    pointerEvent.call(element, element, PointerEventType.pointerout, PointerType.mouse, coordinateX, coordinateY);

                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    expect(hostVisualTooltip.move).not.toHaveBeenCalled();
                });

                it("does not reload tooltip data if reloadTooltipDataOnMouseMove is false", () => {
                    // reloadTooltipDataOnMouseMove is false by default
                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);
                    getTooltipInfoDelegate.mockClear();

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

                    pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);
                    getTooltipInfoDelegate.mockClear();

                    pointerEvent.call(element, element, PointerEventType.pointermove, PointerType.mouse, coordinateX, coordinateY);

                    let selectionId: ISelectionId = getDataPointIdentity(d3Selection.datum());
                    const pointerMoveIdentityCall = getDataPointIdentity.mock.calls[getDataPointIdentity.mock.calls.length - 2];

                    expect(getTooltipInfoDelegate).toHaveBeenCalledWith(d3Selection.datum(), expect.any(PointerEvent));
                    expect(pointerMoveIdentityCall).toEqual([d3Selection.datum(), expect.any(PointerEvent)]);
                    expect(getTooltipInfoDelegate.mock.calls[0][1]).toBe(pointerMoveIdentityCall[1]);
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


            it("mouseover does show tooltip after touchend delay", async () => {
                pointerEvent.call(element, element, PointerEventType.pointerout, PointerType.mouse, coordinateX, coordinateY);

                await new Promise(resolve => setTimeout(resolve, /* slightly more than handleTouchDelay */ 20));

                pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.mouse, coordinateX, coordinateY);

                expect(hostVisualTooltip.show).toHaveBeenCalled();
            });
        });

    });

    describe("handleTouchDelay", () => {
        const showTouchTooltip = (wrapper: TooltipServiceWrapper): void => {
            wrapper.addTooltip(d3Selection, () => [{ displayName: "group", value: "100" }]);
            d3Selection.data(["datum"]);

            pointerEvent.call(element, element, PointerEventType.pointerover, PointerType.touch, 50, 50);
        };

        const wait = (delay: number): Promise<void> =>
            new Promise(resolve => setTimeout(resolve, delay));

        it("falls back to DefaultHandleTouchDelay when it is not specified", async () => {
            showTouchTooltip(new TooltipServiceWrapper({
                tooltipService: hostVisualTooltip
            }));

            await wait(DefaultHandleTouchDelay / 2);
            expect(hostVisualTooltip.show).not.toHaveBeenCalled();

            await wait(DefaultHandleTouchDelay);
            expect(hostVisualTooltip.show).toHaveBeenCalled();
        });

        it("keeps an explicitly passed zero delay", async () => {
            showTouchTooltip(new TooltipServiceWrapper({
                tooltipService: hostVisualTooltip,
                handleTouchDelay: 0
            }));

            await wait(0);
            expect(hostVisualTooltip.show).toHaveBeenCalled();
        });
    });

    describe("hide", () => {
        it("calls host tooltip service", () => {
            tooltipService.hide();

            expect(hostVisualTooltip.hide).toHaveBeenCalled();
        });
    });
});
