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
    // powerbi
    import DataView = powerbi.DataView;

    // powerbi.extensibility.utils.dataview
    import createValueColumns = powerbi.extensibility.utils.dataview.DataViewTransform.createValueColumns;

    // powerbi.extensibility.utils.tooltip
    import tooltipBuilder = powerbi.extensibility.utils.tooltip.tooltipBuilder;

    describe("Tooltip Builder tests", () => {

        it("createTooltipInfo: category & measure", () => {
            let columns: DataViewMetadataColumn[] = [
                {
                    displayName: "cat"
                }, {
                    displayName: "val",
                    isMeasure: true
                },
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
                },
            ];
            let dataView: DataView = {
                metadata: { columns: columns },
                categorical: {
                    categories: [{
                        source: columns[0],
                        values: ["abc", "def"],
                        identity: [],
                    }],
                    values: createValueColumns([
                        {
                            source: columns[2],
                            values: [123, 234]
                        }, {
                            source: columns[2],
                            values: [345, 456]
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
                prototypeDataView.categorical,
                "abc",
                123.321);

            expect(tooltipInfo).toEqual([
                { displayName: "cat", value: "abc" },
                { displayName: "val", value: "123.321" }]);
        });
    });
}
