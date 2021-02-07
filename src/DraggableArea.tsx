import React, { useMemo, useState } from 'react';
import { animated, useTransition } from 'react-spring';
import './styles.css';

export interface DraggableItem {
    key: number;
}

// TODO: begin using this
export interface DraggablePosition {
    item: DraggableItem;
    left: number;
    width: number;
}

export interface DraggableProps {
    items: DraggableItem[];
}

const Draggable: React.FC<DraggableProps> = ({items}) => {
    const [hovered, setHovered] = useState<DraggablePosition | null>(null);
    const [mouseX, setMouseX] = useState(0);
    const [hoveredAfter, setHoveredAfter] = useState(false);

    const onMouseOver = (item: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if(item.key === -1)
        {
            return;
        }
        
        if(hovered?.item.key != item.key)
        {
            setHovered({ item, left: e.currentTarget.offsetLeft, width: e.currentTarget.clientWidth }); 
        }               
    }

    const onMouseLeave = (item: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setHovered(null);
        //window.removeEventListener("mousemove", onMouseMove);
    }

    const onMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setMouseX(e.clientX);
        
        if(!hovered)
        {
            return;
        }

        setHoveredAfter(e.clientX > hovered.left + hovered.width / 2);
    }

    const controlledItems = useMemo(() => {
        if(!hovered)
        {
            return items;
        }

        const placeholder: DraggableItem = { key: -1 }
        const currentIndex = items.findIndex(item => item.key === hovered.item.key);

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
    }, [hovered, hoveredAfter]);

    // const transitions = useTransition(controlledItems, item => item.key, {
    //     from: { opacity: 0 },
    //     enter: { opacity: 1 },
    //     //leave: { opacity: 0 },
    // });

    // const displayItems = useMemo(() => transitions.map(({ item, props, key }) => (<animated.div 
    //     key={key}
    //     style={props}
    //     className={`box ${hovered && item.key === hovered.item.key ? "hovered" : ""} ${item.key === -1 ? "placeholder" : ""}`}
    //     onMouseOver={onMouseOver(item)} 
    //     onMouseLeave={onMouseLeave(item)}
    //     onMouseMove={onMouseMove}
    //     >
    //         <div className={hoveredAfter ? "right" : "left"}></div>    
    //         <div>{item.key.toString()}</div>     

    //     </animated.div>)), [controlledItems]);
    
    
    const displayItems = useMemo(() => 
        controlledItems.map(item => {          
            return (<div 
            className={`box ${hovered && item.key === hovered.item.key ? "hovered" : ""} ${item.key === -1 ? "placeholder" : ""}`}
            onMouseOver={onMouseOver(item)} 
            onMouseLeave={onMouseLeave(item)}
            onMouseMove={onMouseMove}
            >
                <div className={hoveredAfter ? "right" : "left"}></div>    
                <div>{item.key.toString()}</div>     
    
            </div>)
        }), [controlledItems]);

 

    return (<div>
        <div className="root edit">{displayItems}</div>
        <div>{mouseX > 0 ? mouseX : ""}</div>     
    </div>);
}


  export const DroppableArea: React.FC = () => {
    const items: DraggableItem[] = [
        { key: 1 },
        { key: 2 },
        { key: 3 },
        { key: 4 },
        { key: 5 }
    ]
    
    //const [display] = useDraggable(items);

    return <div><Draggable items={items} /></div>;
  };

