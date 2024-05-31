import React, { PropsWithChildren, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import {
  isMobile as libIsMobile,
  isTablet as libIsTablet,
} from "react-device-detect";

import DropContainerComponent from "./subcomponents/DropContainerComponent";
import EditPropertiesComponent from "./subcomponents/EditPropertiesComponent";
import FormPreview from "./subcomponents/FormPreview";
import LeftSidebar from "./LeftSidebar";
import SaveConfirmation from "./SaveConfirmation";

import useFormBuilder from "./hooks/useFormBuilder";
import useFormPreview from "./hooks/useFormPreview";

import { FormItemTypes } from "../../utils/formBuilderUtils";
import { FileType, TemplateType } from "../../types/FormTemplateTypes";

import ArrowLeft from "../../assets/svg/ArrowLeft";
import Save from "../../assets/svg/Save";
import Eye from "../../assets/svg/Eye";

let isMobile: boolean;
if (process.env.NODE_ENV === "localhost") {
  isMobile = window.innerWidth < 1024;
} else {
  isMobile = libIsMobile || libIsTablet || window.innerWidth < 1024;
}

interface FormBuilderProps {
  template: TemplateType;
  file: FileType | null;
  status: string | null;
}

const FormBuilder: React.FC<PropsWithChildren<FormBuilderProps>> = ({
  template,
  file,
  status,
}) => {
  const {
    handleItemAdded,
    saveForm,
    deleteContainer,
    deleteControl,
    editContainerProperties,
    editControlProperties,
    moveControl,
    moveControlFromSide,
    selectControl,
    selectedTemplate,
    formLayoutComponents,
    selectedControl,
  } = useFormBuilder({ template });

  const navigate = useNavigate();
  const [showSaveConfirmation, setShowSaveConfirmation] =
    useState<boolean>(false);

  const { showPreview, openPreviewDrawer, closePreviewDrawer } =
    useFormPreview();

  return (
    <>
      {!isMobile ? (
        <div className="d-flex flex-column h-100">
          <DndProvider backend={HTML5Backend}>
            <div className="d-flex flex-row gap-4 justify-content-between w-100 h-100">
              <div
                className="h-100 bg-white border-end"
                style={{
                  overflowY: "auto",
                  minWidth: "300px",
                  maxWidth: "300px",
                }}
              >
                <LeftSidebar
                  handleItemAdded={handleItemAdded}
                  formLayoutComponents={formLayoutComponents}
                  file={file}
                />
              </div>

              <div className="d-flex flex-column h-100 flex-fill py-4">
                <div className="col-lg-12 d-flex flex-column h-100">
                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <h5 className="">{selectedTemplate?.formName}</h5>

                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigate("/")}
                        className="btn btn-sm bg-transparent text-dark-emphasis fw-medium"
                        type="button"
                      >
                        <ArrowLeft width="16" height="16" />
                      </button>
                      {status === "draft" ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm bg-transparent text-success-emphasis fw-medium"
                            onClick={() => saveForm(setShowSaveConfirmation)}
                          >
                            <Save width="16" height="16" />
                          </button>
                          <button
                            onClick={() => openPreviewDrawer()}
                            className="btn btn-sm bg-transparent text-info-emphasis fw-medium"
                            type="button"
                          >
                            <Eye width="16" height="16" />
                          </button>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>

                  <div
                    className="mt-3 overflow-auto flex-1 h-100"
                    style={{
                      overflowY: "auto",
                    }}
                  >
                    {formLayoutComponents.map((layout, ind) => {
                      return (
                        <div>
                          <DropContainerComponent
                            key={layout.container.id}
                            index={ind}
                            layout={layout.container}
                            selectedControl={selectedControl}
                            childrenComponents={layout.children}
                            deleteContainer={deleteContainer}
                            deleteControl={deleteControl}
                            selectControl={selectControl}
                            accept={FormItemTypes.CONTROL}
                            moveControl={moveControl}
                          />
                        </div>
                      );
                    })}

                    <DropContainerComponent
                      accept={FormItemTypes.CONTAINER}
                      name={"Parent Component"}
                      handleItemAdded={handleItemAdded}
                    />
                  </div>
                </div>
              </div>

              <div
                className="h-100 p-4 bg-white border-start"
                style={{
                  minWidth: "350px",
                  maxWidth: "350px",
                  overflowY: "auto",
                }}
              >
                <EditPropertiesComponent
                  selectedControl={selectedControl}
                  selectControl={selectControl}
                  formLayoutComponents={formLayoutComponents}
                  moveControlFromSide={moveControlFromSide}
                  editContainerProperties={editContainerProperties}
                  editControlProperties={editControlProperties}
                />
              </div>
            </div>
            {/* Preview Drawer */}
            <FormPreview
              screenType="mobile"
              showPreview={showPreview}
              formLayoutComponents={formLayoutComponents}
              closePreviewDrawer={closePreviewDrawer}
            />
            {/* Confirmation Drawer */}
          </DndProvider>
        </div>
      ) : (
        <>
          <div className="wrapper mt-5">
            <p className="text-center text-info-emphasis">
              Form Builder is only supported on desktop devices for now. Please
              switch to a desktop device.
            </p>
          </div>
        </>
      )}

      <SaveConfirmation
        template={template}
        formLayoutComponents={formLayoutComponents}
        openDialog={showSaveConfirmation}
        setOpenDialog={setShowSaveConfirmation}
        file={file}
      />
    </>
  );
};

export default FormBuilder;
