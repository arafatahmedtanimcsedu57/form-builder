import React, { PropsWithChildren } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { redirect, useNavigate } from "react-router-dom";
import ConfirmationBeforePublish from "./subcomponents/ConfirmationBeforePublish";

import { useAppDispatch } from "../../redux/hooks";
import { publishTemplate } from "../../redux/entities/formBuilderEntity";

import { convert } from "../../utils/convert";

import {
  FormLayoutComponentsType,
  TemplateType,
} from "../../types/FormTemplateTypes";
import type { FileType } from "../../types/FileType";
import useModalStrip from "../../global-hooks/useModalStrip";

interface SaveConfirmationDialogComponentProps {
  formLayoutComponents: FormLayoutComponentsType[];
  template: TemplateType;
  file: FileType | null;
}

const SaveConfirmation: React.FC<
  PropsWithChildren<SaveConfirmationDialogComponentProps>
> = ({ formLayoutComponents, template, file }) => {
  const dispatch = useAppDispatch();

  const { showModalStrip } = useModalStrip();

  const jsonData = {
    ...(template?.id ? { id: template?.id } : {}),
    formId: template?.formId,
    formName: template?.formName,
    pdf: file,
    blocks: [...convert(formLayoutComponents).blocks],
  };

  const handleFormSubmit = async () => {
    await dispatch(publishTemplate(jsonData));

    showModalStrip("success", "Form is published", 5000);

    // reload here
  };

  return (
    <>
      <button
        type="submit"
        className="btn btn-sm btn-primary px-4 fw-medium"
        onClick={() => handleFormSubmit()}
      >
        Publish
      </button>
    </>
  );
};

export default SaveConfirmation;
