# TooltipService
> The ```TooltipService``` provides the easiest way in order to add tooltips to the custom visuals.

The ```powerbi.extensibility.utils.tooltip``` module provides the following interfaces, classes and functions:

* [createTooltipService](#createtooltipservice)
* [ITooltipService](#itooltipservice)
  * [addTooltip](#itooltipserviceaddtooltip)
  * [hide](#itooltipservicehide)
* [VisualTooltipDataItem](#visualtooltipdataitem)

## createTooltipService
This function creates an instance of ITooltipService.

```typescript
function createTooltipService(hostServices: IVisualHostServices): ITooltipService;
```

The ```IVisualHostServices``` is available in [VisualConstructorOptions](https://github.com/Microsoft/PowerBI-visuals-tools/blob/master/templates/visuals/.api/v1.2.0/PowerBI-visuals.d.ts#L1185).

### Example

```typescript
import tooltip = powerbi.extensibility.utils.tooltip;

tooltip.createTooltipService(host); // host is from the VisualConstructorOptions.

// returns: an instance of ITooltipService.
```

## ITooltipService
This interface describes public methods of the TooltipService.

```typescript
interface ITooltipService {
    addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
    hide(): void;
}
```

### ITooltipService.addTooltip

This method adds tooltips to the current selection.

```typescript
addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
```

#### Example

```typescript
import tooltip = powerbi.extensibility.utils.tooltip;
import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

let element = d3.select("body")
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

let tooltipService = tooltip.createTooltipService(host); // host is from the VisualConstructorOptions.

tooltipService.addTooltip<TooltipEnabledDataPoint>(element, (eventArgs: TooltipEventArgs<TooltipEnabledDataPoint>) => {
    return eventArgs.data.tooltipInfo;
});

// You will see a tooltip if you mouseover the element.
```

## ITooltipService.hide

This method hides the tooltip.

```typescript
hide(): void;
```

### Example

```typescript
let tooltipService = tooltip.createTooltipService(host); // host is from the VisualConstructorOptions.

tooltipService.hide();
```

## VisualTooltipDataItem

This interface describes an instance of the tooltip.

```typescript
interface VisualTooltipDataItem {
    displayName: string;
    value: string;
    color?: string;
    header?: string;
    opacity?: string;
}
```
