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

/// <reference path="../_references.ts"/>

module powerbi.extensibility.utils.tooltip.test {
    // powerbi
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataView = powerbi.DataView;

    // powerbi.extensibility.utils.svg
    import Rect = powerbi.extensibility.utils.svg.Rect;

    // powerbi.extensibility.utils.dataview
    import createValueColumns = powerbi.extensibility.utils.dataview.DataViewTransform.createValueColumns;

    // powerbi.extensibility.utils.test
    import flushAllD3Transitions = powerbi.extensibility.utils.test.helpers.flushAllD3Transitions;
    import testDom = powerbi.extensibility.utils.test.helpers.testDom;

    // powerbi.extensibility.utils.tooltip
    import TooltipOptions = powerbi.extensibility.utils.tooltip.TooltipOptions;
    import VisualTooltipDataItem = powerbi.extensibility.utils.tooltip.VisualTooltipDataItem;
    import TooltipContainer = powerbi.extensibility.utils.tooltip.TooltipContainer;
    import tooltipManager = powerbi.extensibility.utils.tooltip.tooltipManager;
    import ToolTipComponent = powerbi.extensibility.utils.tooltip.ToolTipComponent;
    import TooltipEvent = powerbi.extensibility.utils.tooltip.TooltipEvent;
    import TooltipDataItem = powerbi.extensibility.utils.tooltip.TooltipDataItem;
    import tooltipBuilder = powerbi.extensibility.utils.tooltip.tooltipBuilder;

    // the true dault value of the tooltip container is "flex" but
    // phantomJS doesnt handle flex and defaults instead to block
    // so for the sake of the tests we've used block to check if 
    // it is appearing in the DOM
    let tooltipContainerDefaultDisplay = "flex";

    describe("Tooltip DOM tests", () => {
        let element: JQuery;
        let tooltipInfo: VisualTooltipDataItem[];
        let tooltip: TooltipContainer;

        beforeEach(() => {
            createDomElement();
        });

        it("DOM container exists", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipContainer = getTooltipContainer();
            expect(tooltipContainer.length).toBe(1);
        });

        it("Has single instance of DOM container", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            // Hide
            hideTooltip();

            // Show
            tooltip.show(tooltipInfo, clickedArea);

            // Hide
            hideTooltip();

            // Show
            tooltip.show(tooltipInfo, clickedArea);

            // Show
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipContainer = getTooltipContainer();
            expect(tooltipContainer.length).toBe(1);
        });

        it("DOM two rows exist", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipRow = getTooltipContainer().find(".tooltip-row");

            expect(tooltipRow.length).toBe(2);
        });

        it("DOM two title cells exist", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipTitle = getTooltipContainer().find(".tooltip-title-cell");

            expect(tooltipTitle.length).toBe(2);
        });

        it("DOM two value cells exist", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipValue = getTooltipContainer().find(".tooltip-value-cell");

            expect(tooltipValue.length).toBe(2);
        });

        it("DOM content container exists", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipContentContainer = getTooltipContainer().find(".tooltip-content-container");
            expect(tooltipContentContainer.length).toBe(1);
        });

        it("DOM container visible", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipContainer = getTooltipContainer();
            expect(tooltipContainer.css("display")).toBe(tooltipContainerDefaultDisplay);
        });

        it("DOM container is visible - Show ToolTip", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipContainer = getTooltipContainer();
            expect(tooltipContainer.css("display")).toBe(tooltipContainerDefaultDisplay);
        });

        it("DOM container style Opacity is 1 - Show ToolTip", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            flushAllD3Transitions();

            let tooltipContainerOpacity = getTooltipContainer().css("opacity");
            expect(tooltipContainerOpacity).toBeCloseTo(1, 2);
        });

        it("DOM container hiden - Hide ToolTip", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            // Hide
            hideTooltip();

            let tooltipContainer = getTooltipContainer();
            let display = tooltipContainer.css("display");
            expect(display).toBe("none");
        });

        it("DOM container style Opacity is 1 - Hide ToolTip", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            // Hide
            hideTooltip();

            let tooltipContainerOpacity = getTooltipContainer().css("opacity");
            expect(tooltipContainerOpacity).toBe("0");
        });

        it("DOM arrow exists", () => {
            // Show tooltip
            let clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let tooltipContainer = getTooltipContainer();
            let arrow = tooltipContainer.find(".arrow");
            expect(arrow.length).toBe(1);
        });

        it("DOM arrow position test", () => {
            let clickedArea: Rect;

            // Set test screen size
            tooltip.setTestScreenSize(1000, 700);

            // Show tooltip at top left of the screen
            clickedArea = new Rect(200, 200, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            let arrowClass: string;
            let tooltipContainer = getTooltipContainer();
            let arrow = tooltipContainer.find(".arrow");

            arrowClass = arrow.attr("class");
            expect(arrowClass).toBe("arrow top left");

            // Hide
            hideTooltip();

            // Show tooltip at top right of the screen
            clickedArea = new Rect(600, 100, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            arrowClass = arrow.attr("class");
            expect(arrowClass).toBe("arrow top right");

            // Hide
            hideTooltip();

            // Show tooltip at bottom left of the screen
            clickedArea = new Rect(300, 500, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            arrowClass = arrow.attr("class");
            expect(arrowClass).toBe("arrow bottom left");

            // Hide
            hideTooltip();

            // Show tooltip at bottom right of the screen
            clickedArea = new Rect(700, 800, 0, 0);
            tooltip.show(tooltipInfo, clickedArea);

            arrowClass = arrow.attr("class");
            expect(arrowClass).toBe("arrow bottom right");

            // Hide
            hideTooltip();

            // Reset test screen size
            tooltip.setTestScreenSize(null, null);
        });

        describe("Linechart tooltip", () => {
            beforeEach(() => {
                tooltipInfo = [
                    { header: "Jan", color: "#bbbbaa", displayName: "test 1", value: "111" },
                    { header: "Jan", color: "#bbaaee", displayName: "test 2", value: "222" }
                ];
            });

            it("should have header", () => {
                // Show tooltip
                let clickedArea = new Rect(200, 200, 0, 0);
                tooltip.show(tooltipInfo, clickedArea);

                let tooltipHeader = getTooltipContainer().find(".tooltip-header");

                expect(tooltipHeader.length).toBe(1);
                expect(tooltipHeader.html()).toBe("Jan");
            });

            it("should have dots with color", () => {
                // Show tooltip
                let clickedArea = new Rect(200, 200, 0, 0);
                tooltip.show(tooltipInfo, clickedArea);

                let tooltipColor = getTooltipContainer().find(".tooltip-color-cell");

                expect(tooltipColor.length).toBe(2);
            });

            it("should have the right content", () => {
                // Show tooltip
                let clickedArea = new Rect(200, 200, 0, 0);
                tooltip.show(tooltipInfo, clickedArea);

                let tooltipRow = getTooltipContainer().find(".tooltip-row");
                let firstRow = $(tooltipRow[0]);
                let children = firstRow.children();

                let color = $(children[0]).find("circle")[0].style["fill"];
                let name = $(children[1]).html();
                let value = $(children[2]).html();

                expect(name).toBe("test 1");
                expect(value).toBe("111");
            });
        });

        function hideTooltip() {
            tooltip.hide();
            flushAllD3Transitions();
        }

        function getTooltipContainer(): JQuery {
            return element.find(".tooltip-container");
        }

        function createDomElement() {
            element = testDom("500", "500");

            tooltipInfo = [
                { displayName: "test 1", value: "111" },
                { displayName: "test 2", value: "222" }
            ];

            let options: TooltipOptions = {
                animationDuration: 10,
                opacity: 1,
                offsetX: 10,
                offsetY: 10,
            };

            tooltip = new TooltipContainer(element.get(0), options);
        }
    });

    describe("Legacy TooltipManager", () => {
        let element: JQuery;
        let d3Element: d3.Selection<any>;
        let originalMouseOverDelay = tooltipManager.tooltipMouseOverDelay;

        beforeEach(() => {
            createDomElement();
            tooltipManager.tooltipMouseOverDelay = 40;

            hideTooltip();
            expect(getTooltipDisplayProperty()).toEqual("none");
        });

        afterEach(() => {
            tooltipManager.tooltipMouseOverDelay = originalMouseOverDelay;
        });

        it("Tooltip instance created", () => {
            expect(tooltipManager.ToolTipInstance).toBeDefined();
        });

        it("tooltip is not visible before delay", (done) => {
            emulateShowTooltip();

            setTimeout(() => {
                let display = getTooltipDisplayProperty();
                expect(display).toEqual("none");
                done();
            }, tooltipManager.tooltipMouseOverDelay - 10);
        });

        it("tooltip is visible after delay", (done) => {
            emulateShowTooltip();

            setTimeout(() => {
                let display = getTooltipDisplayProperty();
                expect(display).toEqual(tooltipContainerDefaultDisplay);
                done();
            }, tooltipManager.tooltipMouseOverDelay + 10);
        });

        it("mouseover event should be ignored immediately after touch click", (done) => {
            emulateTouchClick();
            emulateShowTooltip();

            setTimeout(() => {
                let display = getTooltipDisplayProperty();
                expect(display).toEqual("none");
                done();
            }, tooltipManager.tooltipMouseOverDelay + 10);
        });

        it("mouseover event should be valid after touch click + delay", (done) => {
            emulateTouchClick();

            setTimeout(() => {
                emulateShowTooltip();

                setTimeout(() => {
                    let display = getTooltipDisplayProperty();
                    expect(display).toEqual(tooltipContainerDefaultDisplay);
                    done();
                }, tooltipManager.tooltipMouseOverDelay + 10);
            }, tooltipManager.handleTouchDelay + 10);
        });

        function getTooltipContainer(): JQuery {
            return $(".tooltip-container");
        }

        function getTooltipDisplayProperty() {
            let tooltipContainer = getTooltipContainer();
            return tooltipContainer.length > 0 ? tooltipContainer.css("display") : "none";
        }

        function emulateShowTooltip() {
            $(d3Element.node()).d3MouseOver(2, 2);
        }

        function emulateTouchClick() {
            let $element = $(d3Element.node());
            $element.d3TouchStart();
            $element.d3TouchEnd();
        }

        function hideTooltip() {
            tooltipManager.ToolTipInstance.hide();
            flushAllD3Transitions();
        }

        function createDomElement() {
            tooltipManager.ToolTipInstance = new ToolTipComponent();

            element = testDom("500", "500");
            d3Element = d3.select(element.get(0));

            tooltipManager.addTooltip(d3Element, getMockTooltipData);
        }

        function getMockTooltipData(tooltipEvent: TooltipEvent): TooltipDataItem[] {
            return [
                { displayName: "test 1", value: "111" },
                { displayName: "test 2", value: "222" }
            ];
        }
    });

    describe("Tooltip Builder tests", () => {

        it("createTooltipInfo: category & measure", () => {
            let columns: DataViewMetadataColumn[] = [
                {
                    displayName: "cat"
                }, {
                    displayName: "val",
                    isMeasure: true
                }
            ];

            let dataView: DataView = {
                metadata: { columns: columns },
                categorical: {
                    categories: [{
                        source: columns[0],
                        values: ["abc", "def", "ghi"],
                        identity: [],
                        identityFields: [],
                    }],
                    values: createValueColumns([
                        {
                            source: columns[1],
                            values: [123.321, 234.789, 456.001],
                        }])
                }
            };

            let tooltipInfo = tooltipBuilder.createTooltipInfo(
                null,
                dataView.categorical,
                "abc",
                123.321);

            expect(tooltipInfo).toEqual([
                { displayName: "cat", value: "abc" },
                { displayName: "val", value: "123.321" }]);
        });

        it("createTooltipInfo: category, series & measure", () => {
            let columns: DataViewMetadataColumn[] = [
                {
                    displayName: "cat"
                }, {
                    displayName: "ser"
                }, {
                    displayName: "val",
                    isMeasure: true,
                    groupName: "ser1"
                }
            ];

            let dataView: DataView = {
                metadata: { columns: columns },
                categorical: {
                    categories: [{
                        source: columns[0],
                        values: ["abc", "def"],
                    }],
                    values: createValueColumns([
                        {
                            source: columns[2],
                            values: [123, 234],
                        }, {
                            source: columns[2],
                            values: [345, 456],
                        }],
                        undefined,
                        columns[1])
                }
            };

            let tooltipInfo = tooltipBuilder.createTooltipInfo(
                null,
                dataView.categorical,
                "abc",
                123.321);

            expect(tooltipInfo).toEqual([
                { displayName: "cat", value: "abc" },
                { displayName: "ser", value: "ser1" },
                { displayName: "val", value: "123.321" }]);
        });

        it("createTooltipInfo: self cross-joined category & measure", () => {
            let columns: DataViewMetadataColumn[] = [
                {
                    displayName: "cat"
                }, {
                    displayName: "val",
                    isMeasure: true
                },
            ];

            let prototypeDataView = {
                metadata: { columns: columns },
                categorical: {
                    categories: [{
                        source: columns[0],
                        values: ["abc", "def", "ghi"],
                        identity: []
                    }],
                    values: createValueColumns([
                        {
                            source: columns[1],
                            values: [123.321, 234.789, 456.001],
                        }])
                }
            };

            let tooltipInfo = tooltipBuilder.createTooltipInfo(
                null,
                prototypeDataView.categorical,
                "abc",
                123.321);

            expect(tooltipInfo).toEqual([
                { displayName: "cat", value: "abc" },
                { displayName: "val", value: "123.321" }]);
        });
    });
}
