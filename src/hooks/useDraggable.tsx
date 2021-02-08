import arrayMove from "array-move";
import { useEffect, useMemo, useState } from "react";
import { DraggableItem } from "../models/DraggableItem";
import { DraggablePosition } from "../models/DraggablePosition";

export const useDraggable = (items: DraggableItem[]) => {
    const [hovered, setHovered] = useState<DraggablePosition | null>(null);
    const [selected, setSelected] = useState<DraggableItem | null>(null);
    const [hoverAfter, setHoverAfter] = useState(false);

    const itemOrder = useMemo(() => items.reduce(function(map, obj, index) {
        map[obj.key] = index;
        return map;
    }, {} as Record<number, number>), [items]);

    const managedItems = useMemo(() => {
        // don't show placeholder if hovering over the selected item
        if(!selected || !hovered || hovered.item.key === selected?.key)
        {
            return items;
        }

        const placeholder: DraggableItem = {...selected, key: -1};
        const hoveredIndex = itemOrder[hovered.item.key];

        // mouse is hovering over the placeholder
        if(hoveredIndex < 0)
        {
            return items;
        }

        // don't show the placeholder when hovering over the closest half of selected's 2 neighbors
        if(selected)
        {
            const selectedIndex = itemOrder[selected.key];
            const prevRight = hoveredIndex === selectedIndex - 1 && hoverAfter
            const nextLeft = hoveredIndex === selectedIndex + 1 && !hoverAfter

            if(prevRight || nextLeft)
            {
                return items;
            }
        }

        // display the placeholder
        if(!hoverAfter)
        {
            if(hoveredIndex === 0)
            {
                // put placeholder first
                return [placeholder, ...items];
            }
            return [...items.slice(0, hoveredIndex), placeholder, ...items.slice(hoveredIndex, items.length)];
        }
        else
        {
            if(hoveredIndex === items.length - 1)
            {
                // put placeholder last
                return [...items, placeholder];
            }
            return [...items.slice(0, hoveredIndex + 1), placeholder, ...items.slice(hoveredIndex + 1, items.length)];
        }
    }, [hoverAfter, items, itemOrder]);

    const reset = () => {
        setSelected(null);
        setHovered(null);
    }

    const props: DraggableHookProps = {itemOrder, hovered, selected, hoverAfter, setHovered, setSelected, setHoverAfter, reset};

    return { managedItems, props }
}

export interface DraggableHookProps {
    hovered: DraggablePosition | null;
    selected: DraggableItem | null;
    hoverAfter: boolean;
    itemOrder: Record<number, number>;
    setHovered: React.Dispatch<React.SetStateAction<DraggablePosition | null>>;
    setSelected: React.Dispatch<React.SetStateAction<DraggableItem | null>>;
    setHoverAfter: React.Dispatch<React.SetStateAction<boolean>>;    
    reset: () => void;     
} 

export interface useDraggableItemProps extends DraggableHookProps {
    item: DraggableItem;       
    onSelect: (item: DraggableItem) => void;
    onMove: (currentIndex: number, newIndex: number) => void;  
}
export const useDraggableItem = ({item, hovered, hoverAfter, selected, itemOrder, onMove, onSelect, setSelected, setHovered, setHoverAfter, reset} : useDraggableItemProps) => {
    const onClick = (clickedItem: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        console.log("Clicked", clickedItem)
        if(selected && hovered)
        {     
            if(selected.key !== hovered?.item.key)
            {            
                const selectedIntex = itemOrder[selected.key];
                const hoverIndex = itemOrder[hovered.item.key];
                const previous = hoverIndex === 0 ? 0 : hoverIndex - 1;
                const itemCount = Object.keys(itemOrder).length;
                const next = hoverIndex >= itemCount - 1 ? itemCount - 1 : hoverIndex + 1;

                // update items array
                onMove(selectedIntex, hoverAfter ? next : previous );
            }

            // deselect
            reset();

            return;
        }
        //onSelect(clickedItem);    // TODO: Need to re-add the item instead of using array-move
        setSelected(clickedItem);    
        setHovered({ item: clickedItem, left: e.currentTarget.offsetLeft, width: e.currentTarget.clientWidth });   
    }

    const onMouseOver = (item: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // ignore the placeholder
        if(item.key === -1)
        {
            return;
        }

        if(item.key !== hovered?.item.key)
        {
            setHovered({ item, left: e.currentTarget.offsetLeft, width: e.currentTarget.clientWidth });  
        }                  
    }

    const onMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if(!hovered)
        {
            return;
        }

        setHoverAfter(e.clientX > hovered.left + hovered.width / 2);
    }

    const staticProps = {
        item,
        hoverAfter,
        key: itemOrder[item.key],
        onClick: onClick(item),
        hovered: hovered !== null && item.key === hovered.item.key && hovered.item.key !== selected?.key,
        placeholder: item.key === -1,
        selected: selected !== null && selected.key === item.key,        
    }

    const dynamicProps = selected ? {
        onMouseOver: onMouseOver(item),
        onMouseMove: onMouseMove
    } : {}
    
    return { ...staticProps, ...dynamicProps }
}