import React, {
  FormEventHandler,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  addTemplate,
  getAllTemplates,
  hasAlready,
  publishTemplate,
} from "../../redux/entities/formBuilderEntity";
import { getToken, setToken } from "../../redux/auth/token";
import { getLogin } from "../../redux/auth/login";

import useModalStrip from "../../global-hooks/useModalStrip";
import { TemplateType } from "../../types/FormTemplateTypes";
import {
  FormPaginationType,
  GetAllTemplatesRequest,
} from "../../types/ResponseFormTypes";
import { saveFormFile } from "../../redux/file/formFile";

interface NewFormDialogComponentProps {
  openDialog: boolean;
  setOpenDialog: (arg: boolean) => void;
}

const NewFormDialogComponent: FunctionComponent<
  PropsWithChildren<NewFormDialogComponentProps>
> = (props) => {
  const [creatingForm, setCreatingForm] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { showModalStrip } = useModalStrip();
  const authToken = useAppSelector((state) => state.user.access.token);
  const {
    loading: loginLoading,
    error: loginError,
    success: loginSuccess,
  } = useAppSelector((state) => state.user.auth);

  const handleLogin: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const username = e.currentTarget.username.value || "";
    const password = e.currentTarget.password.value || "";

    const data = {
      username,
      password,
    };

    try {
      const { data: _data } = await dispatch(getLogin(data)).unwrap();
      dispatch(setToken(_data));
      props.setOpenDialog(false);
    } catch (ex) {
      showModalStrip("danger", "Invalid credentials", 5000);
    }
  };

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const newFormData = {
      formName: e.currentTarget.formName.value,
      formId: e.currentTarget.formId.value,
      pdf: file,
    };

    setCreatingForm(true);

    try {
      // Check if formId already exists
      const request: GetAllTemplatesRequest = {
        formId: newFormData.formId,
        page: 0,
        size: 1,
      };
      const { payload }: { payload: any } = await dispatch(hasAlready(request));

      if (payload.numberOfElements > 0) {
        throw new Error("Form ID already exists");
      }

      const template: TemplateType = await dispatch(
        publishTemplate(newFormData)
      ).unwrap();

      navigate(
        `/formbuilder/${template.publishStatus || "saved"}-${template.formId}`
      );
    } catch (ex: any) {
      setCreatingForm(false);

      showModalStrip(
        "danger",
        ex.message || "Error occurred while creating a new Form",
        5000
      );
    }
  };

  const { file, loading: fileLoading } = useAppSelector(
    (state) => state.file.file
  );

  const handleUpload = (event: any) => {
    const currentFile = event.target.files[0];
    let data = new FormData();
    data.append("file", currentFile);
    dispatch(saveFormFile(data))
      .then((result) => {
        console.log("saveFormFile success:", result);
      })
      .catch((error) => {
        console.error("saveFormFile error:", error);
      });
  };

  console.log("file in dialog:", file, fileLoading);

  useEffect(() => {
    if (!authToken) dispatch(getToken("GET AUTH TOKEN"));
  }, []);

  return (
    <>
      <Dialog
        open={props.openDialog}
        fullWidth
        maxWidth="sm"
        onClose={() => {
          props.setOpenDialog(false);
        }}
      >
        <DialogContent className="modal-content">
          {!authToken ? (
            <>
              <div className="modal-header">
                <h5 className="modal-title">Please Login</h5>
              </div>
              <div className="modal-body py-4">
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <TextField
                      size="small"
                      label="User Name"
                      name="username"
                      className="form-control"
                      id="userName"
                      key="userName"
                    />
                  </div>
                  <div className="mb-3">
                    <TextField
                      size="small"
                      label="Password"
                      type="password"
                      name="password"
                      id="password"
                      key="password"
                      className="form-control"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary px-4 fw-medium"
                  >
                    {loginLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading
                      </>
                    ) : (
                      "Log In"
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <DialogContent className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter the following details</h5>
              </div>

              <div className="modal-body py-4">
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-3">
                    <TextField
                      required
                      size="small"
                      label="Form Name"
                      name="formName"
                      id="formName"
                      key="formName"
                      className="form-control"
                      defaultValue=""
                    />
                  </div>

                  <div className="mb-3">
                    <TextField
                      required
                      size="small"
                      label="Form ID"
                      name="formId"
                      id="formId"
                      key="formId"
                      className="form-control"
                      defaultValue=""
                    />
                  </div>

                  <div>
                    <input
                      className="form-control btn border mb-3"
                      type="file"
                      onChange={handleUpload}
                      disabled={fileLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-sm btn-success fw-medium px-4"
                    disabled={creatingForm || fileLoading}
                  >
                    {creatingForm ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading
                      </>
                    ) : (
                      "Create Form"
                    )}
                  </button>
                </form>
              </div>
            </DialogContent>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewFormDialogComponent;
