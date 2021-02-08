import arrayMove from 'array-move';
import React, { useMemo, useState } from 'react';
import { DraggableBox } from './components/DraggableBox';
import { DraggableItem } from './models/DraggableItem';
import { DraggablePosition } from './models/DraggablePosition';
//import { animated, useTransition } from 'react-spring';

export interface DraggableProps {
    items: DraggableItem[];
    onSelect: (item: DraggableItem) => void;
    onMove: (currentIndex: number, newIndex: number) => void;    
}

const Draggable: React.FC<DraggableProps> = ({ items, onSelect, onMove }) => {
    const [hovered, setHovered] = useState<DraggablePosition | null>(null);
    const [selected, setSelected] = useState<DraggableItem | null>(null);
    const [hoveredAfter, setHoveredAfter] = useState(false);

    const reset = () => {
        setSelected(null);
        setHovered(null);
    }

    const onClick = (clickedItem: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        console.log("Clicked", clickedItem)
        if(selected && hovered)
        {     
            if(selected.key !== hovered?.item.key)
            {            
                const selectedIntex = itemOrder[selected.key];
                const hoverIndex = itemOrder[hovered.item.key];
                const previous = hoverIndex === 0 ? 0 : hoverIndex - 1;
                const next = hoverIndex >= items.length - 1 ? items.length - 1 : hoverIndex + 1;

                // update items array
                onMove(selectedIntex, hoveredAfter ? next : previous );
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

        setHoveredAfter(e.clientX > hovered.left + hovered.width / 2);
    }

    const itemOrder = useMemo(() => items.reduce(function(map, obj, index) {
            map[obj.key] = index;
            return map;
        }, {} as Record<number, number>), [items]);

    const controlledItems = useMemo(() => {
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

        // don't show the placeholder when hovering over the closest half of the selected 2 neighbors
        if(selected)
        {
            const selectedIndex = itemOrder[selected.key];
            const prevRight = hoveredIndex === selectedIndex - 1 && hoveredAfter
            const nextLeft = hoveredIndex === selectedIndex + 1 && !hoveredAfter

            // prev item, don't hover over right side
            if(prevRight || nextLeft)
            {
                return items;
            }
        }

        // display the placeholder
        if(!hoveredAfter)
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
    }, [hoveredAfter, items, itemOrder]);

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
    
    
    // TODO: return these as props from a hook
    const displayItems = useMemo(() => 
        controlledItems.map((item, index) => {     
                const enabledProps = selected ? {
                    onMouseOver: onMouseOver(item),
                    onMouseMove: onMouseMove,                    
                    onClick: onClick(item)
                } : {onClick: onClick(item)};
            
                return <DraggableBox 
                    item={item} 
                    key={index} 
                    {...enabledProps} 
                    hovered={hovered !== null && item.key === hovered.item.key && hovered.item.key !== selected?.key} 
                    placeholder={item.key === -1}
                    selected={selected !== null && selected.key === item.key} 
                    hoveredAfter={hoveredAfter} />
            }), [controlledItems, selected, hovered]);

 

    return (<div>
        <div className="root edit">{displayItems}</div>
        <br />
        <div>{hovered && hovered.item.key}</div>
        <div>{selected ? <div className="root single"><DraggableBox item={selected} /></div> : null}</div>
    </div>);
}


  export const DroppableArea: React.FC = () => {
    const [items, setItems] = useState<DraggableItem[]>([
        { key: 1, label: "box1" },
        { key: 2, label: "box2" },
        { key: 3, label: "box3" },
        { key: 4, label: "box4" },
        { key: 5, label: "box5" }
    ]);

    const onMove = (currentIndex: number, newIndex: number) => {
        setItems(arrayMove(items, currentIndex, newIndex));
    }

    const onSelect = (item: DraggableItem) => {
        setItems(items.filter((i => i.key !== item.key)));
    }

    return <div><Draggable items={items} onMove={onMove} onSelect={onSelect} /></div>;
  };

