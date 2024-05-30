import React, { PropsWithChildren, useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getAllTemplates } from "../redux/entities/formBuilderEntity";

import NewFormDialogComponent from "../components/FormTemplates/NewFormDialogComponent";
import FormLayoutComponent from "../components/FormTemplates/FormLayoutComponent";

import Background from "../assets/svg/Background.svg";

interface TemplatesPageProps {}

const backgroundStyle = {
  backgroundImage: `url(${Background})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
};

const TemplatesPage: React.FC<PropsWithChildren<TemplatesPageProps>> = ({}) => {
  const dispatch = useAppDispatch();
  const templates = useAppSelector(
    (state) => state.entities.formBuilder.allTemplates,
  );
  const authToken = useAppSelector((state) => state.user.access.token);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    if (templates.length === 0 && authToken)
      dispatch(getAllTemplates("GET ALL TEMPLATE"));
  }, [authToken]);

  return (
    <>
      <div style={{ ...backgroundStyle }} className="container main-container">
        <div className="p-5 d-flex flex-column align-items-center gap-5">
          <div className="text__welcome text-center fs-1">
            <div>
              <span className="text-primary text-primary-emphasis">Build</span>{" "}
              <span className="text-primary">beautiful forms</span>
            </div>
            <div className="text-dark-emphasis">in seconds</div>
          </div>
          <div className="d-flex flex-wrap gap-5">
            {/* Create New */}
            <FormLayoutComponent
              template={null}
              createdFormLayout={false}
              setOpenDialog={setOpenDialog}
            />

            {authToken ? (
              <>
                <div className="w-100 text-center">
                  <h4 className="">All Form Templates</h4>
                  <div className="text-muted">
                    Our collection of beautiful templates to create your own
                    forms!
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-5 justify-content-center w-100">
                  {templates.length ? (
                    templates.map((template) => (
                      <FormLayoutComponent
                        key={template.id}
                        template={template}
                        createdFormLayout={true}
                      />
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <NewFormDialogComponent
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      </div>
    </>
  );
};

export default TemplatesPage;
