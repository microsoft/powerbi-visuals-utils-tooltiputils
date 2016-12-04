# TooltipService
> The ```TooltipService``` provides the easiest way in order to add tooltips to the custom visuals.

The ```powerbi.extensibility.utils.tooltip``` module provides the following interface and function:

* [createTooltipServiceWrapper](#createtooltipservicewrapper)
* [ITooltipServiceWrapper](#itooltipservicewrapper)
  * [addTooltip](#itooltipservicewrapperaddtooltip)
  * [hide](#itooltipservicewrapperhide)

## createTooltipServiceWrapper
This function creates an instance of ITooltipServiceWrapper.

```typescript
function createTooltipServiceWrapper(tooltipService: ITooltipService, rootElement: Element, handleTouchDelay?: number): ITooltipServiceWrapper;
```

The ```ITooltipService``` is available in [IVisualHost](https://github.com/Microsoft/PowerBI-visuals-tools/blob/master/templates/visuals/.api/v1.3.0/PowerBI-visuals.d.ts#L1267).

### Example

```typescript
import tooltip = powerbi.extensibility.utils.tooltip;

export class YourVisual implements IVisual {
    // implementation of IVisual.

    constructor(options: VisualConstructorOptions) {
        tooltip.createTooltipServiceWrapper(
            options.host.tooltipService,
            options.element);

        // returns: an instance of ITooltipServiceWrapper.
    }
}
```

## ITooltipServiceWrapper
This interface describes public methods of the TooltipService.

```typescript
interface ITooltipServiceWrapper {
    addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
    hide(): void;
}
```

### ITooltipServiceWrapper.addTooltip

This method adds tooltips to the current selection.

```typescript
addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
```

#### Example

```typescript
import tooltip = powerbi.extensibility.utils.tooltip;
import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

let bodyElement = d3.select("body");

let element = bodyElement
    .append("div")
    .style({
        "background-color": "green",
        "width": "150px",
        "height": "150px"
    })
    .classed("visual", true)
    .data([{
        tooltipInfo: [{
            displayName: "Power BI",
            value: 2016
        }]
    }]);

let tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(tooltipService, bodyElement.get(0)); // tooltipService is from the IVisualHost.

tooltipServiceWrapper.addTooltip<TooltipEnabledDataPoint>(element, (eventArgs: TooltipEventArgs<TooltipEnabledDataPoint>) => {
    return eventArgs.data.tooltipInfo;
});

// You will see a tooltip if you mouseover the element.
```

## ITooltipServiceWrapper.hide

This method hides the tooltip.

```typescript
hide(): void;
```

### Example

```typescript
import tooltip = powerbi.extensibility.utils.tooltip;

let tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, options.element); // options is from the VisualConstructorOptions.

tooltipServiceWrapper.hide();
```
