import React, { FunctionComponent } from "react";
import { useDrag } from "react-dnd";
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
  FormLayoutComponentsType,
} from "../../../types/FormTemplateTypes";
import ThreeDotsVertical from "../../../assets/svg/ThreeDotsVertical";

interface ControlDragComponentProps {
  handleItemAdded: (
    item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType,
    containerId?: string,
  ) => void;
  item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType;
  formLayoutComponents: FormLayoutComponentsType[];
}

const ControlDragComponent: FunctionComponent<ControlDragComponentProps> = (
  props,
) => {
  const { item, handleItemAdded } = props;

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: item.itemType,
      item: item,
      end: (
        item:
          | FormLayoutComponentChildrenType
          | FormLayoutComponentContainerType,
        monitor: any,
      ) => {
        const dropResult: FormLayoutComponentContainerType =
          monitor.getDropResult();
        if (item && dropResult) {
          if (item.itemType === "container") {
            handleItemAdded(item);
          } else if (item.itemType === "control") {
            handleItemAdded(item, dropResult.id);
          }
        }
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }),
    [props.formLayoutComponents],
  );

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div ref={drag} style={{ opacity, cursor: "move" }} className="col-6">
      <div className="text-nowrap p-3 border w-10 h-100 d-flex align-items-center justify-content-center rounded-3">
        {item.displayText}
      </div>
    </div>
  );
};

export default ControlDragComponent;
