import React, { PropsWithChildren, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { getToken, setToken } from "../../redux/auth/token";

interface FormLayoutComponentProps {
  setOpenDialog?: (arg: boolean) => void;
}

const ActionSection: React.FC<PropsWithChildren<FormLayoutComponentProps>> = ({
  setOpenDialog,
}) => {
  const dispatch = useAppDispatch();
  const authToken = useAppSelector((state) => state.user.access.token);

  useEffect(() => {
    if (!authToken) dispatch(getToken("GET AUTH TOKEN"));
  }, []);

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => {
            return setOpenDialog ? setOpenDialog(true) : null;
          }}
          className="btn btn-primary shadow px-5 fw-medium mb-3"
        >
          {authToken ? `Let's Create` : `Log In`}
        </button>
      </div>
    </>
  );
};

const FormLayoutComponent: React.FC<
  PropsWithChildren<FormLayoutComponentProps>
> = ({ setOpenDialog }) => {
  const title = "Create a New Form";

  const description =
    "Begin from scratch. Click the button below to start designing a form tailored to your specific needs.";

  const cardStyle = { width: "100%" };
  const className = `card  ${"bg-transparent text-center border-0  "}`;

  return (
    <>
      <div
        className={className}
        style={{
          ...cardStyle,
        }}
      >
        <div className="card-body d-flex flex-column justify-content-between p-4">
          <div className="d-flex gap-2 justify-content-between align-items-center flex-wrap">
            <div className={`w-100 `}>
              <h5 className="card-title text-dark-emphasis">{title}</h5>
            </div>
          </div>

          <p className="card-text text-dark-emphasis">{description}</p>

          <ActionSection setOpenDialog={setOpenDialog} />
        </div>
      </div>
    </>
  );
};

export default FormLayoutComponent;
