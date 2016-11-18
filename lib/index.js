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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var tooltip;
            (function (tooltip) {
                var LegacyTooltipService = (function () {
                    function LegacyTooltipService() {
                    }
                    LegacyTooltipService.prototype.addTooltip = function (selection, getTooltipInfoDelegate, getDataPointIdentity, reloadTooltipDataOnMouseMove) {
                        // Default to the old tooltip system if the host does not support tooltips.
                        tooltip.tooltipManager.addTooltip(selection, getTooltipInfoDelegate, reloadTooltipDataOnMouseMove);
                    };
                    LegacyTooltipService.prototype.hide = function () {
                        tooltip.tooltipManager.ToolTipInstance.hide();
                    };
                    return LegacyTooltipService;
                }());
                tooltip.LegacyTooltipService = LegacyTooltipService;
            })(tooltip = utils.tooltip || (utils.tooltip = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var tooltip;
            (function (tooltip) {
                var getCoordinates = powerbi.extensibility.utils.svg.getCoordinates;
                var Point = powerbi.extensibility.utils.svg.touch.Point;
                var Rectangle = powerbi.extensibility.utils.svg.touch.Rectangle;
                var Rect = powerbi.extensibility.utils.svg.Rect;
                var createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
                ;
                var ContainerClassName = createClassAndSelector("tooltip-container");
                var ContentContainerClassName = createClassAndSelector("tooltip-content-container");
                var ArrowClassName = createClassAndSelector("arrow");
                var TooltipHeaderClassName = createClassAndSelector("tooltip-header");
                var TooltipRowClassName = createClassAndSelector("tooltip-row");
                var TooltipColorCellClassName = createClassAndSelector("tooltip-color-cell");
                var TooltipTitleCellClassName = createClassAndSelector("tooltip-title-cell");
                var TooltipValueCellClassName = createClassAndSelector("tooltip-value-cell");
                var TooltipContainer = (function () {
                    function TooltipContainer(rootElement, options) {
                        this.isTooltipVisible = false;
                        this.options = options;
                        this.rootElement = rootElement;
                    }
                    TooltipContainer.prototype.isVisible = function () {
                        return this.isTooltipVisible;
                    };
                    /** Note: For tests only */
                    TooltipContainer.prototype.setTestScreenSize = function (width, height) {
                        this.customScreenWidth = width;
                        this.customScreenHeight = height;
                    };
                    TooltipContainer.prototype.show = function (tooltipData, clickedArea) {
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
                    };
                    TooltipContainer.prototype.move = function (tooltipData, clickedArea) {
                        if (!this.tooltipContainer) {
                            this.tooltipContainer = this.createTooltipContainer(this.rootElement);
                        }
                        if (tooltipData) {
                            this.setTooltipContent(tooltipData);
                        }
                        this.setPosition(clickedArea);
                    };
                    TooltipContainer.prototype.hide = function () {
                        if (this.isTooltipVisible) {
                            this.isTooltipVisible = false;
                            this.tooltipContainer
                                .transition()
                                .duration(this.options.animationDuration)
                                .style("opacity", 0)
                                .each("end", function () { this.style.display = "none"; });
                        }
                    };
                    TooltipContainer.prototype.createTooltipContainer = function (root) {
                        var container = d3.select(root)
                            .append("div")
                            .attr("class", ContainerClassName.class);
                        container.append("div").attr("class", ArrowClassName.class);
                        container.append("div").attr("class", ContentContainerClassName.class);
                        container.style("display", "none");
                        return container;
                    };
                    TooltipContainer.prototype.setTooltipContent = function (tooltipData) {
                        if (_.isEqual(tooltipData, this.currentContent))
                            return;
                        this.currentContent = tooltipData;
                        var rowsSelector = TooltipRowClassName.selector;
                        var contentContainer = this.tooltipContainer.select(ContentContainerClassName.selector);
                        // Clear existing content
                        contentContainer.selectAll(TooltipHeaderClassName.selector).remove();
                        contentContainer.selectAll(TooltipRowClassName.selector).remove();
                        if (tooltipData.length === 0)
                            return;
                        if (tooltipData[0].header) {
                            contentContainer.append("div").attr("class", TooltipHeaderClassName.class).text(tooltipData[0].header);
                        }
                        var tooltipRow = contentContainer.selectAll(rowsSelector).data(tooltipData);
                        var newRow = tooltipRow.enter().append("div").attr("class", TooltipRowClassName.class);
                        if (_.some(tooltipData, function (tooltipItem) { return tooltipItem.color; })) {
                            var newColorCell = newRow.filter(function (d) { return d.color; }).append("div").attr("class", TooltipColorCellClassName.class);
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
                                "fill": function (d) { return d.color; },
                                "fill-opacity": function (d) { return d.opacity != null ? d.opacity : 1; },
                            });
                        }
                        var newTitleCell = newRow.append("div").attr("class", TooltipTitleCellClassName.class);
                        var newValueCell = newRow.append("div").attr("class", TooltipValueCellClassName.class);
                        newTitleCell.text(function (d) { return d.displayName; });
                        newValueCell.text(function (d) { return d.value; });
                    };
                    TooltipContainer.prototype.getTooltipContainerBounds = function () {
                        var tooltipContainerBounds;
                        if (this.tooltipContainer.style("display") === "none") {
                            this.tooltipContainer.style("display", "");
                            tooltipContainerBounds = this.tooltipContainer.node().getBoundingClientRect();
                            this.tooltipContainer.style("display", "none");
                        }
                        else {
                            tooltipContainerBounds = this.tooltipContainer.node().getBoundingClientRect();
                        }
                        return tooltipContainerBounds;
                    };
                    TooltipContainer.prototype.getTooltipPosition = function (clickedArea, clickedScreenArea) {
                        var tooltipContainerBounds = this.getTooltipContainerBounds();
                        var centerPointOffset = Math.floor(clickedArea.width / 2);
                        var offsetX = 0;
                        var offsetY = 0;
                        var centerPoint = new Point(clickedArea.left + centerPointOffset, clickedArea.top + centerPointOffset);
                        var arrowOffset = 7;
                        if (clickedScreenArea === 0 /* TopLeft */) {
                            offsetX += 3 * arrowOffset + centerPointOffset;
                            offsetY -= 2 * arrowOffset + centerPointOffset;
                        }
                        else if (clickedScreenArea === 1 /* TopRight */) {
                            offsetX -= (2 * arrowOffset + tooltipContainerBounds.width + centerPointOffset);
                            offsetY -= 2 * arrowOffset + centerPointOffset;
                        }
                        else if (clickedScreenArea === 3 /* BottomLeft */) {
                            offsetX += 3 * arrowOffset + centerPointOffset;
                            offsetY -= (tooltipContainerBounds.height - 2 * arrowOffset + centerPointOffset);
                        }
                        else if (clickedScreenArea === 2 /* BottomRight */) {
                            offsetX -= (2 * arrowOffset + tooltipContainerBounds.width + centerPointOffset);
                            offsetY -= (tooltipContainerBounds.height - 2 * arrowOffset + centerPointOffset);
                        }
                        centerPoint.offset(offsetX, offsetY);
                        return centerPoint;
                    };
                    TooltipContainer.prototype.setPosition = function (clickedArea) {
                        var clickedScreenArea = this.getClickedScreenArea(clickedArea);
                        var tooltipPosition = this.getTooltipPosition(clickedArea, clickedScreenArea);
                        this.setTooltipContainerClass(clickedScreenArea);
                        this.tooltipContainer.style({ "left": tooltipPosition.x + "px", "top": tooltipPosition.y + "px" });
                        this.setArrowPosition(clickedScreenArea);
                    };
                    TooltipContainer.prototype.setTooltipContainerClass = function (clickedScreenArea) {
                        var tooltipContainerClassName;
                        switch (clickedScreenArea) {
                            case 0 /* TopLeft */:
                            case 3 /* BottomLeft */:
                                tooltipContainerClassName = "left";
                                break;
                            case 1 /* TopRight */:
                            case 2 /* BottomRight */:
                                tooltipContainerClassName = "right";
                                break;
                        }
                        this.tooltipContainer
                            .attr("class", ContainerClassName.class) // Reset all classes
                            .classed(tooltipContainerClassName, true);
                    };
                    TooltipContainer.prototype.setArrowPosition = function (clickedScreenArea) {
                        var arrow = this.getArrowElement();
                        var arrowClassName;
                        if (clickedScreenArea === 0 /* TopLeft */) {
                            arrowClassName = "top left";
                        }
                        else if (clickedScreenArea === 1 /* TopRight */) {
                            arrowClassName = "top right";
                        }
                        else if (clickedScreenArea === 3 /* BottomLeft */) {
                            arrowClassName = "bottom left";
                        }
                        else {
                            arrowClassName = "bottom right";
                        }
                        arrow
                            .attr("class", "arrow") // Reset all classes
                            .classed(arrowClassName, true);
                    };
                    TooltipContainer.prototype.getArrowElement = function () {
                        return this.tooltipContainer.select(ArrowClassName.selector);
                    };
                    TooltipContainer.prototype.getClickedScreenArea = function (clickedArea) {
                        /*
                         * We use this construction below in order to avoid the following exception in Microsoft Edge and Mozilla Firefox: "'get innerWidth' called on an object that does not implement interface Window".
                         * Power BI creates a fake of the window object, so these browsers throw that exception.
                         */
                        var currentWindow = window.window && window !== window.window
                            ? window.window
                            : window;
                        var screenWidth = this.customScreenWidth || currentWindow.innerWidth;
                        var screenHeight = this.customScreenHeight || currentWindow.innerHeight;
                        var centerPointOffset = clickedArea.width / 2;
                        var centerPoint = new Point(clickedArea.left + centerPointOffset, clickedArea.top + centerPointOffset);
                        var halfWidth = screenWidth / 2;
                        var halfHeight = screenHeight / 2;
                        if (centerPoint.x < halfWidth && centerPoint.y < halfHeight) {
                            return 0 /* TopLeft */;
                        }
                        else if (centerPoint.x >= halfWidth && centerPoint.y < halfHeight) {
                            return 1 /* TopRight */;
                        }
                        else if (centerPoint.x < halfWidth && centerPoint.y >= halfHeight) {
                            return 3 /* BottomLeft */;
                        }
                        else if (centerPoint.x >= halfWidth && centerPoint.y >= halfHeight) {
                            return 2 /* BottomRight */;
                        }
                    };
                    return TooltipContainer;
                }());
                tooltip.TooltipContainer = TooltipContainer;
                /**
                 * Legacy tooltip component. Please use the tooltip host service instead.
                 */
                var ToolTipComponent = (function () {
                    function ToolTipComponent(tooltipOptions) {
                        this.tooltipOptions = tooltipOptions;
                        if (!tooltipOptions) {
                            this.tooltipOptions = ToolTipComponent.DefaultTooltipOptions;
                        }
                        // NOTE: This will be called statically by the TooltipManager, thus we need to defer creation of the tooltip container until we actually have a root element.
                    }
                    ToolTipComponent.prototype.isTooltipComponentVisible = function () {
                        return this.tooltipContainer && this.tooltipContainer.isVisible();
                    };
                    ToolTipComponent.prototype.show = function (tooltipData, clickedArea) {
                        this.ensureTooltipContainer();
                        this.tooltipContainer.show(tooltipData, this.convertRect(clickedArea));
                    };
                    ToolTipComponent.prototype.move = function (tooltipData, clickedArea) {
                        this.ensureTooltipContainer();
                        this.tooltipContainer.move(tooltipData, this.convertRect(clickedArea));
                    };
                    ToolTipComponent.prototype.hide = function () {
                        this.ensureTooltipContainer();
                        this.tooltipContainer.hide();
                    };
                    ToolTipComponent.prototype.convertRect = function (rect) {
                        return new Rect(rect.x, rect.y, rect.width, rect.height);
                    };
                    ToolTipComponent.prototype.ensureTooltipContainer = function () {
                        if (!this.tooltipContainer) {
                            var root = d3.select(ToolTipComponent.parentContainerSelector).node();
                            this.tooltipContainer = new TooltipContainer(root, this.tooltipOptions);
                        }
                    };
                    ToolTipComponent.DefaultTooltipOptions = {
                        opacity: 1,
                        animationDuration: 250,
                        offsetX: 10,
                        offsetY: 10
                    };
                    ToolTipComponent.parentContainerSelector = ".visual";
                    ToolTipComponent.highlightedValueDisplayNameResorceKey = "Tooltip_HighlightedValueDisplayName";
                    return ToolTipComponent;
                }());
                tooltip.ToolTipComponent = ToolTipComponent;
                /**
                 * Legacy tooltip management API. Please use the tooltip host service instead.
                 */
                var tooltipManager;
                (function (tooltipManager) {
                    var GlobalTooltipEventsAttached = false;
                    tooltipManager.ShowTooltips = true;
                    tooltipManager.ToolTipInstance = new ToolTipComponent();
                    tooltipManager.tooltipMouseOverDelay = 350;
                    tooltipManager.tooltipMouseOutDelay = 500;
                    tooltipManager.tooltipTouchDelay = 350;
                    tooltipManager.handleTouchDelay = 1000;
                    var tooltipTimeoutId;
                    var handleTouchTimeoutId = 0;
                    var mouseCoordinates;
                    var tooltipData;
                    function addTooltip(selection, getTooltipInfoDelegate, reloadTooltipDataOnMouseMove, onMouseOutDelegate) {
                        if (!tooltipManager.ShowTooltips) {
                            return;
                        }
                        var rootNode = d3.select(ToolTipComponent.parentContainerSelector).node();
                        // Mouse events
                        selection.on("mouseover.tooltip", function () {
                            var target = d3.event.target;
                            var data = d3.select(target).datum();
                            // Ignore mouseover while handling touch events
                            if (handleTouchTimeoutId || !canDisplayTooltip(d3.event))
                                return;
                            mouseCoordinates = getCoordinates(rootNode, true);
                            var elementCoordinates = getCoordinates(target, true);
                            var tooltipEvent = {
                                data: data,
                                coordinates: mouseCoordinates,
                                elementCoordinates: elementCoordinates,
                                context: target,
                                isTouchEvent: false
                            };
                            clearTooltipTimeout();
                            // if it is already visible, change contents immediately (use 16ms minimum perceivable frame rate to prevent thrashing)
                            var delay = tooltipManager.ToolTipInstance.isTooltipComponentVisible() ? 16 : tooltipManager.tooltipMouseOverDelay;
                            tooltipTimeoutId = showDelayedTooltip(tooltipEvent, getTooltipInfoDelegate, delay);
                        });
                        selection.on("mouseout.tooltip", function () {
                            if (!handleTouchTimeoutId) {
                                clearTooltipTimeout();
                                tooltipTimeoutId = hideDelayedTooltip();
                            }
                            if (onMouseOutDelegate) {
                                onMouseOutDelegate();
                            }
                        });
                        selection.on("mousemove.tooltip", function () {
                            var target = d3.event.target;
                            var data = d3.select(target).datum();
                            // Ignore mousemove while handling touch events
                            if (handleTouchTimeoutId || !canDisplayTooltip(d3.event))
                                return;
                            mouseCoordinates = getCoordinates(rootNode, true);
                            var elementCoordinates = getCoordinates(target, true);
                            var tooltipEvent = {
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
                        var touchStartEventName = getTouchStartEventName();
                        var touchEndEventName = getTouchEndEventName();
                        var isPointerEvent = touchStartEventName === "pointerdown" || touchStartEventName === "MSPointerDown";
                        if (!GlobalTooltipEventsAttached) {
                            // Add root container hide tooltip event
                            attachGlobalEvents(touchStartEventName);
                            GlobalTooltipEventsAttached = true;
                        }
                        selection.on(touchStartEventName, function () {
                            var target = d3.event.target;
                            var data = d3.select(target).datum();
                            hideTooltipEventHandler();
                            var coordinates = getCoordinates(rootNode, isPointerEvent);
                            var elementCoordinates = getCoordinates(target, isPointerEvent);
                            var tooltipEvent = {
                                data: data,
                                coordinates: coordinates,
                                elementCoordinates: elementCoordinates,
                                context: target,
                                isTouchEvent: true
                            };
                            clearTooltipTimeout();
                            tooltipTimeoutId = showDelayedTooltip(tooltipEvent, getTooltipInfoDelegate, tooltipManager.tooltipTouchDelay);
                        });
                        selection.on(touchEndEventName, function () {
                            clearTooltipTimeout();
                            if (handleTouchTimeoutId)
                                clearTimeout(handleTouchTimeoutId);
                            // At the end of touch action, set a timeout that will let us ignore the incoming mouse events for a small amount of time
                            handleTouchTimeoutId = setTimeout(function () {
                                handleTouchTimeoutId = 0;
                            }, tooltipManager.handleTouchDelay);
                        });
                    }
                    tooltipManager.addTooltip = addTooltip;
                    function showDelayedTooltip(tooltipEvent, getTooltipInfoDelegate, delayInMs) {
                        return setTimeout(function () { return showTooltipEventHandler(tooltipEvent, getTooltipInfoDelegate); }, delayInMs);
                    }
                    function hideDelayedTooltip() {
                        return setTimeout(function () { return hideTooltipEventHandler(); }, tooltipManager.tooltipMouseOutDelay);
                    }
                    function setLocalizedStrings(localizationOptions) {
                        ToolTipComponent.localizationOptions = localizationOptions;
                    }
                    tooltipManager.setLocalizedStrings = setLocalizedStrings;
                    function showTooltipEventHandler(tooltipEvent, getTooltipInfoDelegate) {
                        var tooltipInfo = tooltipData || getTooltipInfoDelegate(tooltipEvent);
                        if (!_.isEmpty(tooltipInfo)) {
                            var coordinates = mouseCoordinates || tooltipEvent.coordinates;
                            var clickedArea = getClickedArea(coordinates[0], coordinates[1], tooltipEvent.isTouchEvent);
                            tooltipManager.ToolTipInstance.show(tooltipInfo, clickedArea);
                        }
                    }
                    function moveTooltipEventHandler(tooltipEvent, getTooltipInfoDelegate, reloadTooltipDataOnMouseMove) {
                        tooltipData = undefined;
                        if (reloadTooltipDataOnMouseMove) {
                            tooltipData = getTooltipInfoDelegate(tooltipEvent);
                        }
                        var clickedArea = getClickedArea(tooltipEvent.coordinates[0], tooltipEvent.coordinates[1], tooltipEvent.isTouchEvent);
                        tooltipManager.ToolTipInstance.move(tooltipData, clickedArea);
                    }
                    ;
                    function hideTooltipEventHandler() {
                        tooltipManager.ToolTipInstance.hide();
                    }
                    ;
                    function clearTooltipTimeout() {
                        if (tooltipTimeoutId) {
                            clearTimeout(tooltipTimeoutId);
                        }
                    }
                    function canDisplayTooltip(d3Event) {
                        var cadDisplay = true;
                        var mouseEvent = d3Event;
                        if (mouseEvent.buttons !== undefined) {
                            // Check mouse buttons state
                            var hasMouseButtonPressed = mouseEvent.buttons !== 0;
                            cadDisplay = !hasMouseButtonPressed;
                        }
                        return cadDisplay;
                    }
                    function getTouchStartEventName() {
                        var eventName = "touchstart";
                        if (window["PointerEvent"]) {
                            // IE11
                            eventName = "pointerdown";
                        }
                        else if (window["MSPointerEvent"]) {
                            // IE10
                            eventName = "MSPointerDown";
                        }
                        return eventName;
                    }
                    function getTouchEndEventName() {
                        var eventName = "touchend";
                        if (window["PointerEvent"]) {
                            // IE11
                            eventName = "pointerup";
                        }
                        else if (window["MSPointerEvent"]) {
                            // IE10
                            eventName = "MSPointerUp";
                        }
                        return eventName;
                    }
                    function attachGlobalEvents(touchStartEventName) {
                        d3.select(ToolTipComponent.parentContainerSelector).on(touchStartEventName, function (d, i) {
                            tooltipManager.ToolTipInstance.hide();
                        });
                    }
                    function getClickedArea(x, y, isTouchEvent) {
                        var width = 0;
                        var pointX = x;
                        var pointY = y;
                        if (isTouchEvent) {
                            width = 12;
                            var offset = width / 2;
                            pointX = Math.max(x - offset, 0);
                            pointY = Math.max(y - offset, 0);
                        }
                        return new Rectangle(pointX, pointY, width, width);
                    }
                })(tooltipManager = tooltip.tooltipManager || (tooltip.tooltipManager = {}));
            })(tooltip = utils.tooltip || (utils.tooltip = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var tooltip;
            (function (tooltip) {
                /**
                 * It uses if API doesn't support Tooltip API and Tooltip LegacyTooltipService isn't available.
                 */
                var VisualHostTooltipServiceFallback = (function () {
                    function VisualHostTooltipServiceFallback() {
                        this._enabled = false;
                    }
                    VisualHostTooltipServiceFallback.prototype.show = function (args) { };
                    VisualHostTooltipServiceFallback.prototype.move = function (args) { };
                    VisualHostTooltipServiceFallback.prototype.hide = function (args) { };
                    VisualHostTooltipServiceFallback.prototype.container = function () {
                        if (!this._container) {
                            this._container = document.createElement("div");
                        }
                        return this._container;
                    };
                    VisualHostTooltipServiceFallback.prototype.enabled = function () {
                        return this._enabled;
                    };
                    return VisualHostTooltipServiceFallback;
                }());
                tooltip.VisualHostTooltipServiceFallback = VisualHostTooltipServiceFallback;
            })(tooltip = utils.tooltip || (utils.tooltip = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var tooltip;
            (function (tooltip) {
                // powerbi.extensibility.utils.svg
                var touch = powerbi.extensibility.utils.svg.touch;
                var VisualHostTooltipServiceFallback = powerbi.extensibility.utils.tooltip.VisualHostTooltipServiceFallback;
                var LegacyTooltipService = powerbi.extensibility.utils.tooltip.LegacyTooltipService;
                function createTooltipService(hostServices) {
                    var visualHostTooltipService;
                    if (hostServices && hostServices.tooltips) {
                        visualHostTooltipService = hostServices.tooltips();
                    }
                    if (!visualHostTooltipService && LegacyTooltipService) {
                        return new LegacyTooltipService();
                    }
                    if (!visualHostTooltipService) {
                        visualHostTooltipService = new VisualHostTooltipServiceFallback();
                    }
                    return new TooltipService(visualHostTooltipService);
                }
                tooltip.createTooltipService = createTooltipService;
                var DefaultHandleTouchDelay = 1000;
                var TooltipService = (function () {
                    function TooltipService(visualHostTooltipService, handleTouchDelay) {
                        if (handleTouchDelay === void 0) { handleTouchDelay = DefaultHandleTouchDelay; }
                        this.visualHostTooltipService = visualHostTooltipService;
                        this.handleTouchDelay = handleTouchDelay;
                    }
                    TooltipService.prototype.addTooltip = function (selection, getTooltipInfoDelegate, getDataPointIdentity, reloadTooltipDataOnMouseMove) {
                        var _this = this;
                        if (!this.visualHostTooltipService.enabled()) {
                            return;
                        }
                        var rootNode = this.visualHostTooltipService.container();
                        // Mouse events
                        selection.on("mouseover.tooltip", function () {
                            // Ignore mouseover while handling touch events
                            if (!_this.canDisplayTooltip(d3.event))
                                return;
                            var tooltipEventArgs = _this.makeTooltipEventArgs(rootNode, true, false);
                            if (!tooltipEventArgs)
                                return;
                            var tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                            if (tooltipInfo == null)
                                return;
                            var selectionId = getDataPointIdentity && getDataPointIdentity(tooltipEventArgs);
                            var identity = selectionId && selectionId.getSelectorsByColumn();
                            _this.visualHostTooltipService.show({
                                coordinates: tooltipEventArgs.coordinates,
                                isTouchEvent: false,
                                dataItems: tooltipInfo,
                                identities: identity ? [identity] : [],
                            });
                        });
                        selection.on("mouseout.tooltip", function () {
                            _this.visualHostTooltipService.hide({
                                isTouchEvent: false,
                                immediately: false,
                            });
                        });
                        selection.on("mousemove.tooltip", function () {
                            // Ignore mousemove while handling touch events
                            if (!_this.canDisplayTooltip(d3.event))
                                return;
                            var tooltipEventArgs = _this.makeTooltipEventArgs(rootNode, true, false);
                            if (!tooltipEventArgs)
                                return;
                            var tooltipInfo;
                            if (reloadTooltipDataOnMouseMove) {
                                tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                                if (tooltipInfo == null)
                                    return;
                            }
                            var selectionId = getDataPointIdentity(tooltipEventArgs);
                            var identity = selectionId && selectionId.getSelectorsByColumn();
                            _this.visualHostTooltipService.move({
                                coordinates: tooltipEventArgs.coordinates,
                                isTouchEvent: false,
                                dataItems: tooltipInfo,
                                identities: identity ? [identity] : [],
                            });
                        });
                        // --- Touch events ---
                        var touchStartEventName = touch.touchStartEventName();
                        var touchEndEventName = touch.touchEndEventName();
                        var isPointerEvent = touch.usePointerEvents();
                        selection.on(touchStartEventName + ".tooltip", function () {
                            _this.visualHostTooltipService.hide({
                                isTouchEvent: true,
                                immediately: true,
                            });
                            var tooltipEventArgs = _this.makeTooltipEventArgs(rootNode, isPointerEvent, true);
                            if (!tooltipEventArgs)
                                return;
                            var tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                            var selectionId = getDataPointIdentity(tooltipEventArgs);
                            var identity = selectionId && selectionId.getSelectorsByColumn();
                            _this.visualHostTooltipService.show({
                                coordinates: tooltipEventArgs.coordinates,
                                isTouchEvent: true,
                                dataItems: tooltipInfo,
                                identities: identity ? [identity] : [],
                            });
                        });
                        selection.on(touchEndEventName + ".tooltip", function () {
                            _this.visualHostTooltipService.hide({
                                isTouchEvent: true,
                                immediately: false,
                            });
                            if (_this.handleTouchTimeoutId)
                                clearTimeout(_this.handleTouchTimeoutId);
                            // At the end of touch action, set a timeout that will let us ignore the incoming mouse events for a small amount of time
                            // TODO: any better way to do this?
                            _this.handleTouchTimeoutId = setTimeout(function () {
                                _this.handleTouchTimeoutId = undefined;
                            }, _this.handleTouchDelay);
                        });
                    };
                    TooltipService.prototype.hide = function () {
                        this.visualHostTooltipService.hide({ immediately: true, isTouchEvent: false });
                    };
                    TooltipService.prototype.makeTooltipEventArgs = function (rootNode, isPointerEvent, isTouchEvent) {
                        var target = d3.event.target;
                        var data = d3.select(target).datum();
                        var mouseCoordinates = this.getCoordinates(rootNode, isPointerEvent);
                        var elementCoordinates = this.getCoordinates(target, isPointerEvent);
                        var tooltipEventArgs = {
                            data: data,
                            coordinates: mouseCoordinates,
                            elementCoordinates: elementCoordinates,
                            context: target,
                            isTouchEvent: isTouchEvent
                        };
                        return tooltipEventArgs;
                    };
                    TooltipService.prototype.canDisplayTooltip = function (d3Event) {
                        var canDisplay = true;
                        var mouseEvent = d3Event;
                        if (mouseEvent.buttons !== undefined) {
                            // Check mouse buttons state
                            var hasMouseButtonPressed = mouseEvent.buttons !== 0;
                            canDisplay = !hasMouseButtonPressed;
                        }
                        // Make sure we are not ignoring mouse events immediately after touch end.
                        canDisplay = canDisplay && (this.handleTouchTimeoutId == null);
                        return canDisplay;
                    };
                    TooltipService.prototype.getCoordinates = function (rootNode, isPointerEvent) {
                        var coordinates;
                        if (isPointerEvent) {
                            // DO NOT USE - WebKit bug in getScreenCTM with nested SVG results in slight negative coordinate shift
                            // Also, IE will incorporate transform scale but WebKit does not, forcing us to detect browser and adjust appropriately.
                            // Just use non-scaled coordinates for all browsers, and adjust for the transform scale later (see lineChart.findIndex)
                            // coordinates = d3.mouse(rootNode);
                            // copied from d3_eventSource (which is not exposed)
                            var e = d3.event, s = void 0;
                            while (s = e.sourceEvent)
                                e = s;
                            var rect = rootNode.getBoundingClientRect();
                            coordinates = [e.clientX - rect.left - rootNode.clientLeft, e.clientY - rect.top - rootNode.clientTop];
                        }
                        else {
                            var touchCoordinates = d3.touches(rootNode);
                            if (touchCoordinates && touchCoordinates.length > 0) {
                                coordinates = touchCoordinates[0];
                            }
                        }
                        return coordinates;
                    };
                    return TooltipService;
                }());
                tooltip.TooltipService = TooltipService;
            })(tooltip = utils.tooltip || (utils.tooltip = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var tooltip;
            (function (tooltip) {
                // powerbi.extensibility.utils.formatting
                var valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
                var ToolTipComponent = powerbi.extensibility.utils.tooltip.ToolTipComponent;
                var tooltipBuilder;
                (function (tooltipBuilder) {
                    // TODO: implement options bag as input parameter
                    function createTooltipInfo(formatStringProp, dataViewCat, categoryValue, value, categories, seriesData, seriesIndex, categoryIndex, highlightedValue, gradientValueColumn) {
                        var categorySource;
                        var seriesSource = [];
                        var valuesSource = undefined;
                        seriesIndex = seriesIndex | 0;
                        var categoriesData = dataViewCat ? dataViewCat.categories : categories;
                        if (categoriesData && categoriesData.length > 0) {
                            if (categoriesData.length > 1) {
                                var compositeCategoriesData = [];
                                for (var i = 0, ilen = categoriesData.length; i < ilen; i++) {
                                    compositeCategoriesData.push(categoriesData[i].source);
                                }
                                categorySource = { value: categoryValue, metadata: compositeCategoriesData };
                            }
                            else {
                                categorySource = { value: categoryValue, metadata: [categoriesData[0].source] };
                            }
                        }
                        if (dataViewCat && dataViewCat.values) {
                            if (categorySource && categorySource.metadata[0] === dataViewCat.values.source) {
                            }
                            else {
                                valuesSource = dataViewCat.values.source;
                            }
                            if (dataViewCat.values.length > 0) {
                                var valueColumn = dataViewCat.values[seriesIndex];
                                var isAutoGeneratedColumn = !!(valueColumn && valueColumn.source && valueColumn.source.isAutoGeneratedColumn);
                                if (!isAutoGeneratedColumn) {
                                    seriesSource.push({ value: value, highlightedValue: highlightedValue, metadata: valueColumn });
                                }
                            }
                            // Create Gradient tooltip value
                            var gradientToolTipData = createGradientToolTipData(gradientValueColumn, categoryIndex);
                            if (gradientToolTipData != null)
                                seriesSource.push(gradientToolTipData);
                        }
                        if (seriesData) {
                            for (var i = 0, len = seriesData.length; i < len; i++) {
                                var singleSeriesData = seriesData[i];
                                if (categorySource && categorySource.metadata[0] === singleSeriesData.metadata.source)
                                    continue;
                                seriesSource.push({ value: singleSeriesData.value, metadata: singleSeriesData.metadata });
                            }
                        }
                        var tooltipInfo = createTooltipData(formatStringProp, categorySource, valuesSource, seriesSource);
                        return tooltipInfo;
                    }
                    tooltipBuilder.createTooltipInfo = createTooltipInfo;
                    function createGradientToolTipData(gradientValueColumn, categoryIndex) {
                        if (gradientValueColumn) {
                            // Saturation color
                            return { value: gradientValueColumn.values[categoryIndex], metadata: { source: gradientValueColumn.source, values: [] } };
                        }
                        return null;
                    }
                    tooltipBuilder.createGradientToolTipData = createGradientToolTipData;
                    function createTooltipData(formatStringProp, categoryValue, valuesSource, seriesValues) {
                        var items = [];
                        if (categoryValue) {
                            if (categoryValue.metadata.length > 1) {
                                var displayName = "";
                                // This is being done simply for lat/long for now, as that's the only composite category we use.  If we ever have tooltips
                                //   involving other composite categories, we need to do a more thorough design and be more careful here.
                                for (var i = 0, ilen = categoryValue.metadata.length; i < ilen; i++) {
                                    if (i !== 0)
                                        displayName += "/";
                                    displayName += categoryValue.metadata[i].displayName;
                                }
                                var categoryFormattedValue = getFormattedValue(categoryValue.metadata[0], formatStringProp, categoryValue.value);
                                items.push({ displayName: displayName, value: categoryFormattedValue });
                            }
                            else {
                                var categoryFormattedValue = getFormattedValue(categoryValue.metadata[0], formatStringProp, categoryValue.value);
                                items.push({ displayName: categoryValue.metadata[0].displayName, value: categoryFormattedValue });
                            }
                        }
                        if (valuesSource) {
                            // Dynamic series value
                            var dynamicValue = void 0;
                            if (seriesValues.length > 0) {
                                var dynamicValueMetadata = seriesValues[0].metadata.source;
                                dynamicValue = getFormattedValue(valuesSource, formatStringProp, dynamicValueMetadata.groupName);
                            }
                            items.push({ displayName: valuesSource.displayName, value: dynamicValue });
                        }
                        for (var i = 0; i < seriesValues.length; i++) {
                            var seriesData = seriesValues[i];
                            if (seriesData && seriesData.metadata) {
                                var seriesMetadataColumn = seriesData.metadata.source;
                                var value = seriesData.value;
                                var highlightedValue = seriesData.highlightedValue;
                                if (value || value === 0) {
                                    var formattedValue = getFormattedValue(seriesMetadataColumn, formatStringProp, value);
                                    items.push({ displayName: seriesMetadataColumn.displayName, value: formattedValue });
                                }
                                if (highlightedValue || highlightedValue === 0) {
                                    var formattedHighlightedValue = getFormattedValue(seriesMetadataColumn, formatStringProp, highlightedValue);
                                    var displayName = ToolTipComponent.localizationOptions.highlightedValueDisplayName;
                                    items.push({ displayName: displayName, value: formattedHighlightedValue });
                                }
                            }
                        }
                        return items;
                    }
                    function getFormattedValue(column, formatStringProp, value) {
                        var formatString = getFormatStringFromColumn(column, formatStringProp);
                        return valueFormatter.format(value, formatString);
                    }
                    function getFormatStringFromColumn(column, formatStringProp) {
                        if (column) {
                            var formatString = valueFormatter.getFormatString(column, formatStringProp, true);
                            return formatString || column.format;
                        }
                        return null;
                    }
                })(tooltipBuilder = tooltip.tooltipBuilder || (tooltip.tooltipBuilder = {}));
            })(tooltip = utils.tooltip || (utils.tooltip = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
