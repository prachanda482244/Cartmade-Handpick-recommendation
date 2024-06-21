import React, { useState } from "react";

const DragAndDropComponent = () => {
  const initialItems = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
  const [items, setItems] = useState(initialItems);

  const handleDragStart = (event: any, index: any) => {
    event.dataTransfer.setData("index", index.toString());
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleDrop = (event: any, newIndex: any) => {
    const draggedIndex = parseInt(event.dataTransfer.getData("index"));
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Remove the dragged item from its original position
    newItems.splice(draggedIndex, 1);

    // Insert the dragged item at the new position
    newItems.splice(newIndex, 0, draggedItem);

    setItems(newItems);
  };

  return (
    <div className="container">
      <h2>Drag and Drop Demo</h2>
      <ul className="item-list">
        {items.map((item, index) => (
          <li
            key={index}
            className="item"
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, index)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DragAndDropComponent;
