import arrayMove from 'array-move';
import React, { useMemo, useState } from 'react';
import { useDraggable, useDraggableItem, useDraggableProps } from '../hooks/useDraggable';
import { DraggableItem } from '../models/DraggableItem';
import { DraggableBox } from './DraggableBox';

export const Sample = () => {
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

    const { controlledItems, props } = useDraggable(items);

    const displayItems = controlledItems.map((item) => <Draggable item={item} props={props} onMove={onMove} onSelect={onSelect} />
    );


    return (<div>
        <div className="root edit">{displayItems}</div>
        <br />
        <div>{props.hovered && props.hovered.item.key}</div>
        <div>{props.selected ? <div className="root single"><DraggableBox item={props.selected} /></div> : null}</div>
    </div>)
}

export interface DraggableProps {
    item: DraggableItem;
    props: useDraggableProps;
    onSelect: (item: DraggableItem) => void;
    onMove: (currentIndex: number, newIndex: number) => void;  
}
const Draggable = ({ item, onMove, onSelect, props }: DraggableProps) => {
    const draggableProps = useDraggableItem({ item, onMove, onSelect, ...props })
    return <DraggableBox {...draggableProps} />
}