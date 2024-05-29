import React, { PropsWithChildren, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormBuilder from "../components/FormBuilder/FormBuilder";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  getSingleTemplate,
  setSelectedTemplateNull,
} from "../redux/entities/formBuilderEntity";

import useModalStrip from "../global-hooks/useModalStrip";

interface FormBuilderPageProps {}

const defaultForm = {
  id: "0",
  formName: "",
  createdAt: 0,
  creator: "",
  formLayoutComponents: [],
  lastPublishedAt: 0,
  publishHistory: [],
  publishStatus: "draft",
  updatedAt: 0,
};

const FormBuilderPage: React.FC<
  PropsWithChildren<FormBuilderPageProps>
> = ({}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const template = useAppSelector(
    (state) => state.entities.formBuilder.selectedTemplate,
  );
  const { formId } = useParams();

  const { showModalStrip } = useModalStrip();

  useEffect(() => {
    (async () => {
      try {
        const template = await dispatch(
          getSingleTemplate(formId as string),
        ).unwrap();
        if (!template) throw new Error("Not found");
      } catch (ex) {
        showModalStrip("danger", "The form id is not correct", 5000);
        navigate("/");
      }
    })();

    return () => {
      dispatch(setSelectedTemplateNull());
    };
  }, []);

  return (
    <div className="container-fluid p-0 playground d-flex flex-column">
      {template ? (
        <FormBuilder template={template ? template : defaultForm} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default FormBuilderPage;
