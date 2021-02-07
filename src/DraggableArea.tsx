import arrayMove from 'array-move';
import React, { useMemo, useState } from 'react';
//import { animated, useTransition } from 'react-spring';
import './styles.css';

export interface DraggableItem {
    key: number;
    label: string;
}

// TODO: begin using this
export interface DraggablePosition {
    item: DraggableItem;
    left: number;
    width: number;
}

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
        if(selected)
        {     
            if(selected.key !== hovered?.item.key)
            {            
                const selectedIntex = items.findIndex(item => item.key === selected.key);
                const hoverIndex = items.findIndex(item => item.key === hovered?.item.key);
                const previous = hoverIndex === 0 ? 0 : hoverIndex - 1;
                const next = hoverIndex >= items.length - 1 ? items.length - 1 : hoverIndex;

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
        
        setHovered({ item, left: e.currentTarget.offsetLeft, width: e.currentTarget.clientWidth });             
    }

    const onMouseLeave = (item: DraggableItem) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setHovered(null);
    }

    const onMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if(!hovered)
        {
            return;
        }

        setHoveredAfter(e.clientX > hovered.left + hovered.width / 2);
    }

    const controlledItems = useMemo(() => {
        if(!selected || !hovered || hovered.item.key === selected?.key)
        {
            return items;
        }

        const placeholder: DraggableItem = {...selected, key: -1};
        const currentIndex = items.findIndex(item => item.key === hovered.item.key);

        if(currentIndex < 0)
        {
            return items;
        }

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
    }, [hovered, hoveredAfter, items]);

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
        controlledItems.map((item, index) => {     
                const enabledProps = selected ? {
                    onMouseOver: onMouseOver(item),
                    onMouseLeave: onMouseLeave(item),
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

  export interface DraggableBoxProps {
      item: DraggableItem;
      key?: number;
      hovered?: boolean;
      selected?: boolean;
      placeholder?: boolean;
      hoveredAfter?: boolean;
  }

  const DraggableBox = ({item, key, selected, hovered, hoveredAfter, placeholder, ...rest}: DraggableBoxProps) => (<div   
    {...rest}   
    key={key}       
    className={`box ${hovered ? "hovered" : ""} ${placeholder ? "placeholder" : ""} ${selected ? "selected" : ""}`}       
    >
        <div className={hoveredAfter ? "right" : "left"}>{item.label}</div>     
    </div>)