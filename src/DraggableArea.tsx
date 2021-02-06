import React, { useMemo, useState } from 'react';
import './styles.css';

export interface DraggableItem {
    key: number;
}

// TODO: begin using this
export interface DraggablePosition {
    key: number;
    index: number;
    left: number;
    width: number;
}

/*
    Ideas
    -should the DroppableArea keep track of the mouse movement?
        -only want the current item to care when onMouseOver
            -don't want all children to be iterated on every mouse movement.
            -how will it work if the user wants to drop an item into the blank area at the end of the list?
*/

const useDraggable = (items: DraggableItem[]) => {
    const [hovered, setHovered] = useState<DraggableItem | null>(null);
    const [mouseX, setMouseX] = useState(0);
    const [itemLeft, setItemLeft] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);
    const [hoveredAfter, setHoveredAfter] = useState(false);

    const controlledItems = useMemo(() => {
        if(!hovered)
        {
            return items;
        }

        const placeholder: DraggableItem = { key: -1 }
        const currentIndex = items.findIndex(item => item.key === hovered.key);

        if(currentIndex < 0)
        {
            return items;
        }

        //TODO: splice the array and put item in the middle
        if(!hoveredAfter)
        {
            if(currentIndex === 0)
            {
                // put placeholder first
                return [placeholder, ...items];
            }
            return [...items.slice(0, currentIndex), placeholder, ...items.slice(currentIndex, items.length)];
        }
        else
        {
            if(currentIndex === items.length - 1)
            {
                // put placeholder last
                return [...items, placeholder];
            }
            return [...items.slice(0, currentIndex + 1), placeholder, ...items.slice(currentIndex + 1, items.length)];
        }

        // return items.reduce((prev, cur, index) => {            
        //     return hoveredAfter ? [...prev, cur] : [...prev, cur];
        // }, []as DraggableItem[]);
    }, [hovered, hoveredAfter]);

    const onMouseEnter = (item: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if(item.key === -1)
        {
            return;
        }
        
        setItemLeft(e.currentTarget.offsetLeft);
        setItemWidth(e.currentTarget.clientWidth);
        setHovered(item);        
    }

    const onMouseLeave = (item: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setHovered(null);
        //window.removeEventListener("mousemove", onMouseMove);
    }

    // const onMouseOver = (item: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    //     setMouseX(e.clientX);
    //     //window.addEventListener("mousemove", onMouseMove);
    // }

    const onMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // TODO: need to know where this box is with relation to the mouse cursor (is the mouse cursor over the left or right side?)
        setMouseX(e.clientX);

        const left = e.currentTarget.offsetLeft;
        const width = e.currentTarget.clientWidth;
        //const top = e.currentTarget.offsetTop;

        setHoveredAfter(e.clientX > itemLeft + itemWidth / 2);
    }

    const displayItems =  controlledItems.map(item => {
        
        
        return (<div 
        className={`box ${hovered && item.key === hovered.key ? "hovered" : ""}`}
        onMouseEnter={onMouseEnter(item)} 
        onMouseLeave={onMouseLeave(item)}
        // onMouseOver={onMouseOver(item)}
        onMouseMove={onMouseMove}
        >
            <div className={hoveredAfter ? "right" : "left"}></div>    
            <div>{item.key.toString()}</div>     

        </div>)
    });

    const display = <div>
            <div className="root edit">{displayItems}</div>
            <div>{mouseX > 0 ? mouseX : ""}</div>
            <div>{itemLeft} - {itemLeft + itemWidth}</div>       
        </div>

    return [display] as const
}


  export const DroppableArea: React.FC = () => {
    const items: DraggableItem[] = [
        { key: 1 },
        { key: 2 },
        { key: 3 },
        { key: 4 },
        { key: 5 }
    ]
    
    const [display] = useDraggable(items);

    return <div>{display}</div>;
  };

