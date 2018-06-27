import { ITooltipServiceWrapper, TooltipEventArgs } from "./tooltipInterfaces";
import { Selection } from "d3";
import powerbi from "powerbi-visuals-tools";
import ISelectionId = powerbi.visuals.ISelectionId;
import ITooltipService = powerbi.extensibility.ITooltipService;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
export declare function createTooltipServiceWrapper(tooltipService: ITooltipService, rootElement: Element, handleTouchDelay?: number): ITooltipServiceWrapper;
export declare class TooltipServiceWrapper implements ITooltipServiceWrapper {
    private handleTouchTimeoutId;
    private visualHostTooltipService;
    private rootElement;
    private handleTouchDelay;
    constructor(tooltipService: ITooltipService, rootElement: Element, handleTouchDelay?: number);
    addTooltip<T>(selection: Selection<any, any, any, any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
    private getSelectionIds;
    hide(): void;
    private makeTooltipEventArgs;
    private canDisplayTooltip;
    private getCoordinates;
}
