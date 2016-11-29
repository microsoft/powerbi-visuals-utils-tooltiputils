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

/// <reference path="_references.ts"/>

module powerbi.extensibility.utils.tooltip.test {
    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;

    import createVisualHost = powerbi.extensibility.utils.test.mocks.createVisualHost;
    import testDom = powerbi.extensibility.utils.test.helpers.testDom;
    import createTouchesList = powerbi.extensibility.utils.test.helpers.createTouchesList;
    import createTouch = powerbi.extensibility.utils.test.helpers.createTouch;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import VisualTooltipDataItem = powerbi.extensibility.utils.tooltip.VisualTooltipDataItem;
    import LegacyTooltipService = powerbi.extensibility.utils.tooltip.LegacyTooltipService;
    import createTooltipService = powerbi.extensibility.utils.tooltip.createTooltipService;
    import ITooltipService = powerbi.extensibility.utils.tooltip.ITooltipService;
    import TooltipService = powerbi.extensibility.utils.tooltip.TooltipService;

    describe("createTooltipService", () => {
        it("returns legacy tooltip service when no host tooltip service is available", () => {
            let mockHostServices = createVisualHost();
            let tooltipService = createTooltipService(mockHostServices);

            expect(tooltipService.constructor).toBe(LegacyTooltipService);
        });
    });

    describe("TooltipService", () => {
        let tooltipService: TooltipService;
        let hostVisualTooltip: IMockHostTooltipService;

        beforeEach(() => {
            hostVisualTooltip = jasmine.createSpyObj("tooltipService", [
                "show",
                "move",
                "hide",
                "container",
                "enabled"
            ]);

            hostVisualTooltip.enabled.and.returnValue(true);

            tooltipService = new TooltipService(hostVisualTooltip, /* handleTouchDelay */ 10);
        });

        describe("addTooltip", () => {
            let onSpy: jasmine.Spy;
            let d3Selection: d3.Selection<any>;
            let tooltipRoot: JQuery;
            let element: JQuery;

            beforeEach(() => {
                tooltipRoot = testDom("100px", "100px");
                // avoids having to deal with offset mouse coords
                tooltipRoot.css({
                    position: "absolute",
                    top: 0,
                    left: 0,
                });

                element = $("<div>").appendTo(tooltipRoot);

                d3Selection = d3.select(element.get(0));
                onSpy = spyOn(d3Selection, "on").and.callThrough();

                hostVisualTooltip.container.and.returnValue(tooltipRoot.get(0));
            });

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
                        element.d3MouseOver(50, 50);

                        let mouseCoordinates = translateMouseCoordinates(50, 50);

                        expect(hostVisualTooltip.show).toHaveBeenCalledWith({
                            coordinates: mouseCoordinates,
                            isTouchEvent: false,
                            dataItems: tooltipData,
                            identities: [],
                        });
                    });

                    it("calls into visual to get identities and tooltip data", () => {
                        element.d3MouseOver(50, 50);

                        let mouseCoordinates = translateMouseCoordinates(50, 50);

                        let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                            data: "datum",
                            coordinates: mouseCoordinates,
                            elementCoordinates: translateMouseCoordinates(50, 50),
                            context: element.get(0),
                            isTouchEvent: false
                        };

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                        expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    });

                    it("calls into visual even when no data", () => {
                        d3Selection.data([undefined]);

                        element.d3MouseOver(50, 50);

                        let mouseCoordinates = translateMouseCoordinates(50, 50);

                        let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                            data: undefined,
                            coordinates: mouseCoordinates,
                            elementCoordinates: translateMouseCoordinates(50, 50),
                            context: element.get(0),
                            isTouchEvent: false
                        };

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                        expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    });

                    it("does not show tooltip immediately after touchend", () => {
                        element.d3TouchEnd();
                        element.d3MouseOver(50, 50);

                        expect(hostVisualTooltip.show).not.toHaveBeenCalled();
                    });
                });

                describe("mousemove", () => {
                    it("moves tooltip", () => {
                        element.d3MouseMove(50, 50);

                        let mouseCoordinates = translateMouseCoordinates(50, 50);

                        expect(hostVisualTooltip.move).toHaveBeenCalledWith({
                            coordinates: mouseCoordinates,
                            isTouchEvent: false,
                            dataItems: undefined,
                            identities: [],
                        });
                    });

                    it("calls into visual to get identities", () => {
                        element.d3MouseMove(50, 50);

                        let mouseCoordinates = translateMouseCoordinates(50, 50);

                        let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                            data: "datum",
                            coordinates: mouseCoordinates,
                            elementCoordinates: translateMouseCoordinates(50, 50),
                            context: element.get(0),
                            isTouchEvent: false
                        };

                        expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    });

                    it("calls into visual to get identities even when no data", () => {
                        d3Selection.data([undefined]);

                        element.d3MouseMove(50, 50);

                        let mouseCoordinates = translateMouseCoordinates(50, 50);

                        let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                            data: undefined,
                            coordinates: mouseCoordinates,
                            elementCoordinates: translateMouseCoordinates(50, 50),
                            context: element.get(0),
                            isTouchEvent: false
                        };

                        expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    });

                    it("does not reload tooltip data if reloadTooltipDataOnMouseMove is false", () => {
                        // reloadTooltipDataOnMouseMove is false by default
                        element.d3MouseMove(50, 50);

                        expect(getTooltipInfoDelegate).not.toHaveBeenCalled();
                    });

                    it("reloads tooltip data if reloadTooltipDataOnMouseMove is true", () => {
                        tooltipService.addTooltip(
                            d3Selection,
                            getTooltipInfoDelegate,
                            getDataPointIdentity,
                            true /* reloadTooltipDataOnMouseMove */
                        );

                        element.d3MouseMove(50, 50);

                        let mouseCoordinates = translateMouseCoordinates(50, 50);

                        let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                            data: "datum",
                            coordinates: mouseCoordinates,
                            elementCoordinates: translateMouseCoordinates(50, 50),
                            context: element.get(0),
                            isTouchEvent: false
                        };

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);

                        expect(hostVisualTooltip.move).toHaveBeenCalledWith({
                            coordinates: mouseCoordinates,
                            isTouchEvent: false,
                            dataItems: tooltipData,
                            identities: [],
                        });
                    });
                });

                describe("mouseout", () => {
                    it("hides tooltip", () => {
                        element.d3MouseOut(0, 0);

                        expect(hostVisualTooltip.hide).toHaveBeenCalledWith({
                            isTouchEvent: false,
                            immediately: false,
                        });
                    });
                });

                describe("touchstart", () => {
                    it("shows tooltip", () => {
                        element.d3TouchStart(createTouchesList([createTouch(50, 50, element, /* id */ 0)]));

                        let touchCoordinates = translateTouchCoordinates(50, 50, 0);

                        expect(hostVisualTooltip.show).toHaveBeenCalledWith({
                            coordinates: touchCoordinates,
                            isTouchEvent: true,
                            dataItems: tooltipData,
                            identities: []
                        });
                    });

                    it("calls into visual to get identities and tooltip data", () => {
                        element.d3TouchStart(createTouchesList([createTouch(50, 50, element, /* id */ 0)]));

                        let touchCoordinates = translateTouchCoordinates(50, 50, 0);

                        let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                            data: "datum",
                            coordinates: touchCoordinates,
                            elementCoordinates: translateTouchCoordinates(50, 50, 0),
                            context: element.get(0),
                            isTouchEvent: true
                        };

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                        expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    });

                    it("calls into visual even when no data", () => {
                        d3Selection.data([undefined]);

                        element.d3TouchStart(createTouchesList([createTouch(50, 50, element, /* id */ 0)]));

                        let touchCoordinates = translateTouchCoordinates(50, 50, 0);

                        let expectedTooltipEventArgs: TooltipEventArgs<string> = {
                            data: undefined,
                            coordinates: touchCoordinates,
                            elementCoordinates: translateTouchCoordinates(50, 50, 0),
                            context: element.get(0),
                            isTouchEvent: true
                        };

                        expect(getTooltipInfoDelegate).toHaveBeenCalledWith(expectedTooltipEventArgs);
                        expect(getDataPointIdentity).toHaveBeenCalledWith(expectedTooltipEventArgs);
                    });
                });

                describe("touchend", () => {
                    it("hides tooltip", () => {
                        element.d3TouchEnd();

                        expect(hostVisualTooltip.hide).toHaveBeenCalledWith({
                            isTouchEvent: true,
                            immediately: false,
                        });
                    });
                });

                it("mouseover does show tooltip after touchend delay", (done) => {
                    element.d3TouchEnd();

                    setTimeout(() => {
                        element.d3MouseOver(50, 50);

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
            container: jasmine.Spy;
            enabled: jasmine.Spy;
        }
    });
}
