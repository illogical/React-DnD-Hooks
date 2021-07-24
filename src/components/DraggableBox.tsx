import { DraggableItem } from "../models/DraggableItem";

export interface DraggableBoxProps {
    item: DraggableItem;
    hovered?: boolean;
    selected?: boolean;
    placeholder?: boolean;
    hoveredAfter?: boolean;
}

export const DraggableBox = ({item, selected, hovered, hoveredAfter, placeholder, ...rest}: DraggableBoxProps) => (<div   
  {...rest} 
  key={item.key}        
  className={`box ${hovered ? "hovered" : ""} ${placeholder ? "placeholder" : ""} ${selected ? "selected" : ""}`}       
  >
      <div className={hoveredAfter ? "right" : "left"}>{item.label}</div>     
  </div>)