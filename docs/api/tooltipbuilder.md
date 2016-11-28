# tooltipBuilder
> The ```tooltipBuilder``` provides an ability to create a tooltip by using the dataView object directly.

The ```powerbi.extensibility.utils.tooltip.tooltipBuilder``` provides the following functions:

* [createTooltipInfo](#createtooltipinfo)

## createTooltipInfo

This function creates an instance of ```VisualTooltipDataItem``` by using the dataView object directly.

```typescript
function createTooltipInfo(
    formatStringProp: DataViewObjectPropertyIdentifier, // Please note, this argument isn't supported by valueFormatter, please use the null as value for it.
    dataViewCat: DataViewCategorical,
    categoryValue: any,
    value?: any,
    categories?: DataViewCategoryColumn[],
    seriesData?: TooltipSeriesDataItem[],
    seriesIndex?: number,
    categoryIndex?: number,
    highlightedValue?: any,
    gradientValueColumn?: DataViewValueColumn): VisualTooltipDataItem[];
```

### Example

```typescript
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataView = powerbi.DataView;
import tooltipBuilder = powerbi.extensibility.utils.tooltip.tooltipBuilder;

// lets imagine we have the following columns and dataView in the custom visual provided by Power BI API.

let columns: DataViewMetadataColumn[] = [
    {
        displayName: "Microsoft"
    }, {
        displayName: "Microsoft Corp",
        isMeasure: true
    },
];

let dataView: DataView = {
    metadata: { columns: columns },
    categorical: {
        categories: [{
            source: columns[0],
            values: ["Power BI", "Visuals"],
            identity: [],
            identityFields: [],
        }],
        values: [{
            source: columns[1],
            values: [123.321, 234.789, 456.001]
        }]
    }
};

tooltipBuilder.createTooltipInfo(null, dataView.categorical, "Power BI", 123.321);

/* returns: [
    { "displayName": "Microsoft", "value":"Power BI" },
    { "displayName": "Microsoft Corp", "value":"123.321" }
] */
```
