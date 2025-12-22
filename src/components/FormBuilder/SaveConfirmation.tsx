import React, { PropsWithChildren } from "react";

import type { FileType } from "../../types/FileType";

interface SaveConfirmationDialogComponentProps {
  publishForm: (file: FileType | null) => Promise<void>;
  file: FileType | null;
}

const SaveConfirmation: React.FC<
  PropsWithChildren<SaveConfirmationDialogComponentProps>
> = ({ publishForm, file }) => {
  const handleFormSubmit = async () => {
    await publishForm(file);
  };

  return (
    <>
      <button
        type="submit"
        className="btn btn-sm btn-primary px-4 fw-medium"
        onClick={() => handleFormSubmit()}
      >
        Save
      </button>
    </>
  );
};

export default SaveConfirmation;
