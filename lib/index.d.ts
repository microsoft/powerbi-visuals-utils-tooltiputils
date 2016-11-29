declare module powerbi.extensibility.utils.tooltip {
    import Selector = powerbi.data.Selector;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    interface TooltipEventArgs<TData> {
        data: TData;
        coordinates: number[];
        elementCoordinates: number[];
        context: HTMLElement;
        isTouchEvent: boolean;
    }
    interface VisualTooltipDataItem {
        displayName: string;
        value: string;
        color?: string;
        header?: string;
        opacity?: string;
    }
    interface VisualTooltipShowEventArgs extends VisualTooltipMoveEventArgs {
        dataItems: VisualTooltipDataItem[];
    }
    interface VisualTooltipMoveEventArgs {
        coordinates: number[];
        isTouchEvent: boolean;
        dataItems?: VisualTooltipDataItem[];
        identities: Selector[];
    }
    interface VisualTooltipHideEventArgs {
        isTouchEvent: boolean;
        immediately: boolean;
    }
    interface IVisualHostTooltipService {
        /** Show a tooltip. */
        show(args: VisualTooltipShowEventArgs): void;
        /** Move a visible tooltip. */
        move(args: VisualTooltipMoveEventArgs): void;
        /** Hide a tooltip. */
        hide(args: VisualTooltipHideEventArgs): void;
        /** Gets the container that tooltip elements will be appended to. */
        container(): Element;
        /** Indicates if tooltips are enabled or not. */
        enabled(): boolean;
    }
    interface IVisualHostServices extends IVisualHost {
        tooltips?(): IVisualHostTooltipService;
    }
}
declare module powerbi.extensibility.utils.tooltip {
    class LegacyTooltipService implements ITooltipService {
        addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => TooltipDataItem[], getDataPointIdentity: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
        hide(): void;
    }
}
declare module powerbi.extensibility.utils.tooltip {
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewValueColumn = powerbi.DataViewValueColumn;
    import Rectangle = powerbi.extensibility.utils.svg.touch.Rectangle;
    import IRect = powerbi.extensibility.utils.svg.IRect;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import VisualTooltipDataItem = powerbi.extensibility.utils.tooltip.VisualTooltipDataItem;
    interface TooltipDataItem {
        displayName: string;
        value: string;
        color?: string;
        header?: string;
        opacity?: string;
    }
    interface TooltipOptions {
        opacity: number;
        animationDuration: number;
        offsetX: number;
        offsetY: number;
    }
    interface TooltipEnabledDataPoint {
        tooltipInfo?: TooltipDataItem[];
    }
    interface TooltipCategoryDataItem {
        value?: any;
        metadata: DataViewMetadataColumn[];
    }
    interface TooltipSeriesDataItem {
        value?: any;
        highlightedValue?: any;
        metadata: DataViewValueColumn;
    }
    interface TooltipLocalizationOptions {
        highlightedValueDisplayName: string;
    }
    type TooltipEvent = TooltipEventArgs<any>;
    const enum ScreenQuadrant {
        TopLeft = 0,
        TopRight = 1,
        BottomRight = 2,
        BottomLeft = 3,
    }
    interface ITooltipContainer {
        isVisible(): boolean;
        setTestScreenSize(width: number, height: number): void;
        show(tooltipData?: VisualTooltipDataItem[], clickedArea?: IRect): void;
        move(tooltipData: VisualTooltipDataItem[], clickedArea: IRect): void;
        hide(): void;
    }
    class TooltipContainer implements ITooltipContainer {
        private options;
        private rootElement;
        private tooltipContainer;
        private isTooltipVisible;
        private currentContent;
        private customScreenWidth;
        private customScreenHeight;
        constructor(rootElement: Element, options: TooltipOptions);
        isVisible(): boolean;
        /** Note: For tests only */
        setTestScreenSize(width: number, height: number): void;
        show(tooltipData?: VisualTooltipDataItem[], clickedArea?: IRect): void;
        move(tooltipData: VisualTooltipDataItem[], clickedArea: IRect): void;
        hide(): void;
        private createTooltipContainer(root);
        private setTooltipContent(tooltipData);
        private getTooltipContainerBounds();
        private getTooltipPosition(clickedArea, clickedScreenArea);
        private setPosition(clickedArea);
        private setTooltipContainerClass(clickedScreenArea);
        private setArrowPosition(clickedScreenArea);
        private getArrowElement();
        private getClickedScreenArea(clickedArea);
    }
    /**
     * Legacy tooltip component. Please use the tooltip host service instead.
     */
    class ToolTipComponent {
        tooltipOptions: TooltipOptions;
        static DefaultTooltipOptions: TooltipOptions;
        static parentContainerSelector: string;
        static highlightedValueDisplayNameResorceKey: string;
        static localizationOptions: TooltipLocalizationOptions;
        private tooltipContainer;
        constructor(tooltipOptions?: TooltipOptions);
        isTooltipComponentVisible(): boolean;
        show(tooltipData: TooltipDataItem[], clickedArea: Rectangle): void;
        move(tooltipData: TooltipDataItem[], clickedArea: Rectangle): void;
        hide(): void;
        private convertRect(rect);
        private ensureTooltipContainer();
    }
    /**
     * Legacy tooltip management API. Please use the tooltip host service instead.
     */
    module tooltipManager {
        let ShowTooltips: boolean;
        let ToolTipInstance: ToolTipComponent;
        let tooltipMouseOverDelay: number;
        let tooltipMouseOutDelay: number;
        let tooltipTouchDelay: number;
        let handleTouchDelay: number;
        function addTooltip(selection: d3.Selection<any>, getTooltipInfoDelegate: (tooltipEvent: TooltipEvent) => TooltipDataItem[], reloadTooltipDataOnMouseMove?: boolean, onMouseOutDelegate?: () => void): void;
        function setLocalizedStrings(localizationOptions: TooltipLocalizationOptions): void;
    }
}
declare module powerbi.extensibility.utils.tooltip {
    import IVisualHostTooltipService = powerbi.extensibility.utils.tooltip.IVisualHostTooltipService;
    import VisualTooltipShowEventArgs = powerbi.extensibility.utils.tooltip.VisualTooltipShowEventArgs;
    import VisualTooltipMoveEventArgs = powerbi.extensibility.utils.tooltip.VisualTooltipMoveEventArgs;
    import VisualTooltipHideEventArgs = powerbi.extensibility.utils.tooltip.VisualTooltipHideEventArgs;
    /**
     * It uses if API doesn't support Tooltip API and Tooltip LegacyTooltipService isn't available.
     */
    class VisualHostTooltipServiceFallback implements IVisualHostTooltipService {
        private _container;
        private _enabled;
        show(args: VisualTooltipShowEventArgs): void;
        move(args: VisualTooltipMoveEventArgs): void;
        hide(args: VisualTooltipHideEventArgs): void;
        container(): Element;
        enabled(): boolean;
    }
}
declare module powerbi.extensibility.utils.tooltip {
    import ISelectionId = powerbi.visuals.ISelectionId;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import VisualTooltipDataItem = powerbi.extensibility.utils.tooltip.VisualTooltipDataItem;
    import IVisualHostServices = powerbi.extensibility.utils.tooltip.IVisualHostServices;
    import IVisualHostTooltipService = powerbi.extensibility.utils.tooltip.IVisualHostTooltipService;
    interface ITooltipService {
        addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
        hide(): void;
    }
    function createTooltipService(hostServices: IVisualHostServices): ITooltipService;
    class TooltipService implements ITooltipService {
        private handleTouchTimeoutId;
        private visualHostTooltipService;
        private handleTouchDelay;
        constructor(visualHostTooltipService: IVisualHostTooltipService, handleTouchDelay?: number);
        addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
        hide(): void;
        private makeTooltipEventArgs<T>(rootNode, isPointerEvent, isTouchEvent);
        private canDisplayTooltip(d3Event);
        private getCoordinates(rootNode, isPointerEvent);
    }
}
declare module powerbi.extensibility.utils.tooltip {
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import DataViewValueColumn = powerbi.DataViewValueColumn;
    import DataViewCategorical = powerbi.DataViewCategorical;
    import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
    import VisualTooltipDataItem = powerbi.extensibility.utils.tooltip.VisualTooltipDataItem;
    import TooltipSeriesDataItem = powerbi.extensibility.utils.tooltip.TooltipSeriesDataItem;
    module tooltipBuilder {
        function createTooltipInfo(formatStringProp: DataViewObjectPropertyIdentifier, dataViewCat: DataViewCategorical, categoryValue: any, value?: any, categories?: DataViewCategoryColumn[], seriesData?: TooltipSeriesDataItem[], seriesIndex?: number, categoryIndex?: number, highlightedValue?: any, gradientValueColumn?: DataViewValueColumn): VisualTooltipDataItem[];
        function createGradientToolTipData(gradientValueColumn: DataViewValueColumn, categoryIndex: number): TooltipSeriesDataItem;
    }
}
