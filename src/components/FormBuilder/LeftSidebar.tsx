import React, { FunctionComponent, useState, useCallback } from "react";

import ControlDragComponent from "./subcomponents/ControlDragComponent";
import {
  FormContainerList,
  FormControlList,
} from "../../utils/formBuilderUtils";
import { useAppDispatch } from "../../redux/hooks";
import { resetFormFile, saveFormFile } from "../../redux/file/formFile";
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
  FormLayoutComponentsType,
  TemplateType,
} from "../../types/FormTemplateTypes";
import { FileType } from "../../types/FileType";
import { Dialog, DialogContent } from "@mui/material";

interface LeftSidebarProps {
  handleItemAdded: (
    item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType,
    containerId?: string
  ) => void;
  formLayoutComponents: FormLayoutComponentsType[];
  file: FileType | null;
  fileLoading: boolean;
}

const LeftSidebar: FunctionComponent<LeftSidebarProps> = ({
  handleItemAdded,
  formLayoutComponents,
  file,
  fileLoading,
}) => {
  const dispatch = useAppDispatch();

  const [currentFile, setCurrentFile] = useState<{ file: any }>({ file: "" });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);

  const memoizedFile = React.useMemo(() => file, [file]);
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  const handleChange = (event: any) => {
    setCurrentFile({ file: event.target.files[0] });
  };

  const handleUpload = () => {
    let data = new FormData();
    data.append("file", currentFile.file);
    dispatch(saveFormFile(data))
      .then((result) => {
        console.log("saveFormFile success:", result);
        forceUpdate();
      })
      .catch((error) => {
        console.error("saveFormFile error:", error);
      });
  };

  const removeFile = (file: FileType) => {
    dispatch(resetFormFile(file));
    setIsDialogOpen(true);
  };

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
                  handleItemAdded={handleItemAdded}
                  formLayoutComponents={formLayoutComponents}
                />
              );
            })}
          </div>
        </div>

        <div className="container p-4 bg-light border-bottom">
          <div className="row g-2">
            {FormControlList.map((control) => {
              return (
                <ControlDragComponent
                  key={control.controlName}
                  item={control}
                  handleItemAdded={handleItemAdded}
                  formLayoutComponents={formLayoutComponents}
                />
              );
            })}
          </div>
        </div>
        <div className="container p-4">
          {memoizedFile ? (
            <div className="alert alert-info d-flex gap-2 flex-column">
              <div>
                <span className="text-info-emphasis me-4 fs-7">
                  {memoizedFile?.fileName.split("/").slice(-1)[0]}
                </span>
              </div>
              <div>
                <button
                  onClick={() => removeFile(memoizedFile)}
                  className="btn btn-sm btn-outline-danger px-4"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : fileLoading ? (
            <></>
          ) : (
            <Dialog open={isDialogOpen} fullWidth maxWidth="sm">
              <DialogContent className="modal-content">
                <>
                  <input
                    className="form-control btn border mb-3"
                    type="file"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary fw-medium px-4"
                    onClick={() => {
                      handleUpload();
                      setIsDialogOpen(false);
                    }}
                  >
                    Upload
                  </button>
                </>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
