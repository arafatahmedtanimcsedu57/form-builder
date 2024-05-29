import React, { FunctionComponent } from "react";
import ControlDragComponent from "./subcomponents/ControlDragComponent";
import {
  FormContainerList,
  FormControlList,
} from "../../utils/formBuilderUtils";
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
  FormLayoutComponentsType,
} from "../../types/FormTemplateTypes";

interface LeftSidebarProps {
  handleItemAdded: (
    item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType,
    containerId?: string,
  ) => void;
  formLayoutComponents: FormLayoutComponentsType[];
}

const LeftSidebar: FunctionComponent<LeftSidebarProps> = (props) => {
  return (
    <>
      <h5 className="p-4 m-0 d-flex align-items-center ">Form Components</h5>
      <div className="">
        <div className="container pb-4 px-4 border-bottom">
          <div className="">
            {FormContainerList.map((container) => {
              return (
                <ControlDragComponent
                  key={container.controlName}
                  item={container}
                  handleItemAdded={props.handleItemAdded}
                  formLayoutComponents={props.formLayoutComponents}
                />
              );
            })}
          </div>
        </div>

        <div className="container p-4">
          <div className="row g-2">
            {FormControlList.map((control) => {
              return (
                <ControlDragComponent
                  key={control.controlName}
                  item={control}
                  handleItemAdded={props.handleItemAdded}
                  formLayoutComponents={props.formLayoutComponents}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
