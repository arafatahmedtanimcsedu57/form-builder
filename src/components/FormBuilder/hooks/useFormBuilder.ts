import { useState } from "react";
import moment from "moment";

import { useAppDispatch } from "../../../redux/hooks";
import {
  publishTemplate,
  saveTemplate,
  updateContainer,
  updateField,
  // updateTemplate,
} from "../../../redux/entities/formBuilderEntity";

import {
  FormControlNames,
  FormItemTypes,
  FormPublishStatus,
} from "../../../utils/formBuilderUtils";
import { generateID } from "../../../utils/common";

import useModalStrip from "../../../global-hooks/useModalStrip";
import {
  TemplateType,
  FormLayoutComponentsType,
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "../../../types/FormTemplateTypes";
import convertForm, {
  convertContainerToRequest,
  convertToRequest,
} from "../../../utils/convertResponseToFormStruct";
import { convert } from "../../../utils/convert";

interface useFormBuilderProps {
  template: TemplateType;
}

const useFormBuilder = ({ template }: useFormBuilderProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<null | TemplateType>(
    template
  );
  const [formLayoutComponents, setFormLayoutComponents] = useState<
    FormLayoutComponentsType[]
  >(template.formLayoutComponents);
  const [selectedControl, setSelectedControl] = useState<
    | undefined
    | FormLayoutComponentContainerType
    | FormLayoutComponentChildrenType
  >(undefined);

  const [currentFormName, setCurrentFormName] = useState<string>("");

  const dispatch = useAppDispatch();
  const { showModalStrip } = useModalStrip();

  const handleItemAdded = (
    item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType,
    containerId?: string
  ) => {
    if (item.itemType === FormItemTypes.CONTAINER) {
      const newState = formLayoutComponents.slice();
      newState.push({
        container: {
          ...(item as FormLayoutComponentContainerType),
          // id: generateID(),
          internalId: generateID(),
        },
        children: [],
      });

      setFormLayoutComponents(newState);
    } else if (item.itemType === FormItemTypes.CONTROL) {
      const newState = formLayoutComponents.slice();
      const formContainerId = newState.findIndex(
        (f) => f.container.internalId === containerId
      );
      const formContainer = { ...newState[formContainerId] };
      const obj = {
        ...(item as FormLayoutComponentChildrenType),
        // id: generateID(),
        internalId: generateID(),
        containerId: containerId,
      };

      const childItem = item as FormLayoutComponentChildrenType;
      if (childItem.items)
        obj.items = JSON.parse(JSON.stringify(childItem.items));

      const newChildren = formContainer.children.slice();
      newChildren.push(obj as FormLayoutComponentChildrenType);
      formContainer.children = newChildren;
      newState[formContainerId] = formContainer;

      setFormLayoutComponents(newState);
    }
  };

  const deleteContainer = (containerId: string) => {
    if (confirm("Are you sure you want to delete container?")) {
      const newState = formLayoutComponents.filter(
        (comp) => comp.container.id !== containerId
      );
      setFormLayoutComponents(newState);
      setSelectedControl((prev) =>
        prev &&
        (prev.id === containerId ||
          (prev as FormLayoutComponentChildrenType).containerId === containerId)
          ? undefined
          : prev
      );
    }
  };

  const deleteControl = (controlId: string, containerId: string) => {
    const newState = formLayoutComponents.map((component) => {
      if (component.container.id === containerId) {
        return {
          ...component,
          children: component.children.filter(
            (child) => child.id !== controlId
          ),
        };
      }
      return component;
    });

    setFormLayoutComponents(newState);
    setSelectedControl((prev) =>
      prev && prev.id === controlId ? undefined : prev
    );
  };

  const selectControl = (
    item:
      | FormLayoutComponentChildrenType
      | FormLayoutComponentContainerType
      | undefined
  ) => setSelectedControl(item);

  // Update control properties locally without API call
  const updateControlLocally = (item: FormLayoutComponentChildrenType) => {
    const newState = formLayoutComponents.slice();
    const formContainerId = newState.findIndex(
      (comp) => comp.container.internalId === item.containerId
    );
    if (formContainerId === -1) return;

    const formContainer = { ...newState[formContainerId] };
    formContainer.children = formContainer.children.map((child) =>
      child.internalId === item.internalId ? item : child
    );
    newState[formContainerId] = formContainer;
    setFormLayoutComponents(newState);
  };

  // Update container properties locally without API call
  const updateContainerLocally = (item: FormLayoutComponentContainerType) => {
    const newState = formLayoutComponents.slice();
    const formContainerId = newState.findIndex(
      (comp) => comp.container.internalId === item.internalId
    );
    if (formContainerId === -1) return;

    const formContainer = { ...newState[formContainerId] };
    formContainer.container = {
      ...formContainer.container,
      heading: item.heading,
      subHeading: item.subHeading,
      skipAble: item.skipAble,
      type: item.type,
      sequence: Number(item.sequence),
    };
    newState[formContainerId] = formContainer;
    setFormLayoutComponents(newState);
  };

  const editControlProperties = async (
    status: string,
    item: FormLayoutComponentChildrenType
  ) => {
    if (status === "saved" && item.id) {
      const convertedData = convertToRequest(item);

      if (!convertedData.id) {
        showModalStrip("danger", "Update Block First", 5000);
        return;
      }

      await dispatch(
        updateField({ fieldId: convertedData.id, payload: convertedData })
      ).unwrap();

      showModalStrip("success", "Field updated successfully", 3000);
    }

    const newState = formLayoutComponents.slice();
    const formContainerId = newState.findIndex(
      (comp) => comp.container.internalId === item.containerId
    );
    let formContainer = { ...newState[formContainerId] };

    formContainer?.children?.forEach((child, ind) => {
      if (child.internalId === item.internalId) {
        const newChildren = formContainer.children.slice();
        newChildren[ind] = item;
        formContainer.children = newChildren;
        return;
      }
    });
    newState[formContainerId] = formContainer;
    setFormLayoutComponents(newState);

    if (status === "saved" && !item.id) {
      const jsonData = {
        ...(selectedTemplate?.id ? { id: selectedTemplate?.id } : {}),
        formId: selectedTemplate?.formId,
        formName: selectedTemplate?.formName,
        blocks: [...convert(newState).blocks],
      };

      const response = await dispatch(publishTemplate(jsonData)).unwrap();

      // Convert server response to internal format and update state with server IDs
      if (response) {
        const convertedData = convertForm(response);
        setFormLayoutComponents(convertedData.formLayoutComponents);
        setSelectedTemplate((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            id: convertedData.id,
            formLayoutComponents: convertedData.formLayoutComponents,
          };
        });
      }

      showModalStrip("success", "Form saved successfully", 3000);
    }
  };

  const editContainerProperties = async (
    status: string,
    item: FormLayoutComponentContainerType
  ) => {
    const newState = formLayoutComponents.slice();
    const formContainerId = newState.findIndex(
      (comp) => comp.container.internalId === item.internalId
    );
    const formContainer = { ...newState[formContainerId] };
    formContainer.container = {
      ...formContainer.container,
      heading: item.heading,
      subHeading: item.subHeading,
      skipAble: item.skipAble,
      type: item.type,
      sequence: Number(item.sequence),
    };

    if (status === "saved" && formContainer.container.id) {
      const convertedData = convertContainerToRequest(formContainer);

      if (!convertedData.id) {
        showModalStrip("danger", "Missing something", 5000);
        return;
      }

      await dispatch(
        updateContainer({ fieldId: convertedData.id, payload: convertedData })
      ).unwrap();

      showModalStrip("success", "Block updated successfully", 3000);
    }

    newState[formContainerId] = formContainer;

    setFormLayoutComponents(newState);

    if (status === "saved" && !item.id) {
      const jsonData = {
        ...(selectedTemplate?.id ? { id: selectedTemplate?.id } : {}),
        formId: selectedTemplate?.formId,
        formName: selectedTemplate?.formName,
        blocks: [...convert(newState).blocks],
      };

      const response = await dispatch(publishTemplate(jsonData)).unwrap();

      // Convert server response to internal format and update state with server IDs
      if (response) {
        const convertedData = convertForm(response);
        setFormLayoutComponents(convertedData.formLayoutComponents);
        setSelectedTemplate((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            id: convertedData.id,
            formLayoutComponents: convertedData.formLayoutComponents,
          };
        });
      }

      showModalStrip("success", "Form saved successfully", 3000);
    }
  };

  const clearContainerFields = (containerInternalId: string) => {
    setFormLayoutComponents((prevState) => {
      const newState = prevState.slice();
      const containerIndex = newState.findIndex(
        (f) => f.container.internalId === containerInternalId
      );

      if (containerIndex !== -1) {
        const formContainer = { ...newState[containerIndex] };
        formContainer.children = [];
        newState[containerIndex] = formContainer;
      }

      return newState;
    });
  };

  const populateSignatureFields = (containerInternalId: string) => {
    const signatureFields: FormLayoutComponentChildrenType[] = [
      {
        id: "",
        internalId: generateID(),
        controlName: FormControlNames.INPUTTEXTFIELD,
        displayText: "Text Field",
        description: "Enter your full legal name",
        labelName: "Full Name",
        itemType: FormItemTypes.CONTROL,
        icon: "fas fa-text-height",
        required: true,
        category: "text-elements",
        containerId: containerInternalId,
        placeholder: "Enter your full name",
        name: "full_name",
        sequence: 1,
      },
      {
        id: "",
        internalId: generateID(),
        controlName: FormControlNames.SELECTDROPDOWN,
        displayText: "Select Drop Down",
        description: "Select your relationship",
        labelName: "Relationship",
        itemType: FormItemTypes.CONTROL,
        icon: "fa fa-users",
        required: true,
        category: "select-elements",
        containerId: containerInternalId,
        placeholder: "Select relationship",
        name: "relationship",
        sequence: 2,
        items: [
          { id: "1", label: "Father", value: "father" },
          { id: "2", label: "Mother", value: "mother" },
          { id: "3", label: "Sibling", value: "sibling" },
          { id: "4", label: "Self", value: "self" },
          { id: "5", label: "Other", value: "other" },
        ],
      },
      {
        id: "",
        internalId: generateID(),
        controlName: FormControlNames.DATEFIELD,
        displayText: "Date Picker",
        description: "Select your date of birth",
        labelName: "Date of Birth",
        itemType: FormItemTypes.CONTROL,
        icon: "bi bi-calendar",
        required: true,
        category: "date-elements",
        containerId: containerInternalId,
        placeholder: "Select date of birth",
        name: "date_of_birth",
        sequence: 3,
      },
      {
        id: "",
        internalId: generateID(),
        controlName: FormControlNames.CHECKBOX,
        displayText: "Checkbox",
        description: "",
        labelName: "E-signature Authorization",
        itemType: FormItemTypes.CONTROL,
        icon: "bi bi-check-square",
        required: true,
        category: "select-elements",
        containerId: containerInternalId,
        placeholder: "",
        name: "e_signature_authorization",
        sequence: 4,
        items: [
          {
            id: "1",
            label:
              "By checking this box, I agree that all electronic signatures are the legal equivalent of my manual/handwritten signature and I consent to be legally bound to this agreement",
            value: "agreed",
          },
        ],
      },
      {
        id: "",
        internalId: generateID(),
        controlName: FormControlNames.SIGNATURE,
        displayText: "Signature",
        description: "Please sign here",
        labelName: "Signature",
        itemType: FormItemTypes.CONTROL,
        icon: "fa fa-signature",
        required: true,
        category: "other-elements",
        containerId: containerInternalId,
        placeholder: "Sign here",
        name: "signature",
        sequence: 5,
      },
      {
        id: "",
        internalId: generateID(),
        controlName: FormControlNames.DATEFIELD,
        displayText: "Date Picker",
        description: "Date when signature was provided",
        labelName: "Date of Signature",
        itemType: FormItemTypes.CONTROL,
        icon: "bi bi-calendar",
        required: true,
        category: "date-elements",
        containerId: containerInternalId,
        placeholder: "Select signature date",
        name: "date_of_signature",
        sequence: 6,
      },
    ];

    setFormLayoutComponents((prevState) => {
      const newState = prevState.slice();
      const containerIndex = newState.findIndex(
        (f) => f.container.internalId === containerInternalId
      );

      if (containerIndex !== -1) {
        const formContainer = { ...newState[containerIndex] };
        formContainer.children = signatureFields;
        newState[containerIndex] = formContainer;
      }

      return newState;
    });
  };

  const moveControlFromSide = (
    item: FormLayoutComponentChildrenType,
    { containerId, position }: FormLayoutComponentChildrenType
  ) => {
    let componentsCopy: FormLayoutComponentsType[] = JSON.parse(
      JSON.stringify(formLayoutComponents)
    );

    const currentItemContainer = componentsCopy.filter(
      (con) => con.container.id === item.containerId
    )[0];
    const moveItemToContainer = componentsCopy.filter(
      (con, ind) => con.container.id === containerId
    )[0];

    const itemIndex = currentItemContainer.children.findIndex(
      (child) => child.id === item.id
    );
    const deletedItem = currentItemContainer.children.splice(itemIndex, 1);
    deletedItem[0].containerId = containerId;

    if (position !== undefined)
      moveItemToContainer.children.splice(position, 0, deletedItem[0]);
    else {
      if (item.containerId !== containerId) {
        if (position)
          moveItemToContainer.children.splice(position, 0, deletedItem[0]);
        else moveItemToContainer.children.splice(itemIndex, 0, deletedItem[0]);
      }
    }
    setSelectedControl(deletedItem[0]);
    setFormLayoutComponents(componentsCopy);
  };

  const moveControl = (
    item: FormLayoutComponentChildrenType,
    dragIndex: number,
    hoverIndex: number,
    containerId: string
  ) => {
    if (item === undefined) return;

    let componentsCopy: FormLayoutComponentsType[] = JSON.parse(
      JSON.stringify(formLayoutComponents)
    );

    if (dragIndex !== undefined && item.id) {
      if (item.containerId === containerId) {
        const formContainer = componentsCopy.filter(
          (con) => con.container.id === containerId
        )[0];
        const deletedItem = formContainer.children.splice(
          formContainer.children.findIndex((con) => con.id === item.id),
          1
        );
        if (deletedItem.length === 0) return;

        formContainer.children.splice(hoverIndex, 0, deletedItem[0]);
      }
      setFormLayoutComponents(componentsCopy);
    }
  };

  const checkIfControlsInContainer = () => {
    for (let i = 0; i < formLayoutComponents.length; i++) {
      let componentChildren = formLayoutComponents[i].children;
      if (componentChildren.length === 0) {
        showModalStrip(
          "danger",
          "You need to have controls inside containers before updating.",
          5000
        );
        return false;
      }
    }
    return true;
  };

  const saveForm = (setShowSaveConfirmation: (arg0: boolean) => void) => {
    if (formLayoutComponents.length === 0) {
      showModalStrip("danger", "Form cannot be empty", 5000);
      return;
    }

    if (!checkIfControlsInContainer()) return;

    const currentTemplate = JSON.parse(JSON.stringify(selectedTemplate));

    currentTemplate.formLayoutComponents = formLayoutComponents;
    currentTemplate.publishStatus = FormPublishStatus.DRAFT;
    currentTemplate.updatedAt = moment().unix() * 1000;

    dispatch(saveTemplate(currentTemplate))
      .unwrap()
      .then(() => {
        showModalStrip("success", "Changes in Form Saved.", 5000);
        setShowSaveConfirmation(true);
      });
  };

  // const updateForm = (setShowSaveConfirmation: (arg0: boolean) => void) => {
  //   if (formLayoutComponents.length === 0) {
  //     showModalStrip("danger", "Form cannot be empty", 5000);
  //     return;
  //   }

  //   if (!checkIfControlsInContainer()) return;

  //   const currentTemplate = JSON.parse(JSON.stringify(selectedTemplate));

  //   currentTemplate.formLayoutComponents = formLayoutComponents;
  //   currentTemplate.publishStatus = FormPublishStatus.DRAFT;
  //   currentTemplate.updatedAt = moment().unix() * 1000;

  //   console.log(currentTemplate);
  //   dispatch(updateTemplate(currentTemplate))
  //     .unwrap()
  //     .then(() => {
  //       showModalStrip("success", "Changes in Form Saved.", 5000);
  //       setShowSaveConfirmation(true);
  //     });
  // };

  const saveFormName = (name: string) => {
    const currentTemplate = JSON.parse(JSON.stringify(selectedTemplate));

    currentTemplate.formName = name;
    dispatch(saveTemplate(currentTemplate))
      .unwrap()
      .then(() => {
        showModalStrip("success", "Form Name Updated.", 5000);
      });
  };

  const publishForm = async (file: any) => {
    if (formLayoutComponents.length === 0) {
      showModalStrip("danger", "Form cannot be empty", 5000);
      return;
    }

    if (!checkIfControlsInContainer()) return;

    // Use currentFormName if set, otherwise fall back to selectedTemplate's formName
    const formName =
      currentFormName || selectedTemplate?.formName || template.formName;

    const jsonData = {
      ...(selectedTemplate?.id ? { id: selectedTemplate?.id } : {}),
      formId: selectedTemplate?.formId,
      formName: formName,
      pdf: file,
      blocks: [...convert(formLayoutComponents).blocks],
    };

    try {
      const response = await dispatch(publishTemplate(jsonData)).unwrap();

      // Convert server response to internal format and update state with server IDs
      if (response) {
        const convertedData = convertForm(response);
        setFormLayoutComponents(convertedData.formLayoutComponents);
        setSelectedTemplate((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            id: convertedData.id,
            formName: formName,
            formLayoutComponents: convertedData.formLayoutComponents,
          };
        });
      }

      showModalStrip("success", "Form saved successfully", 3000);
    } catch (error) {
      showModalStrip("danger", "Failed to save form", 5000);
    }
  };

  return {
    handleItemAdded,
    deleteContainer,
    deleteControl,
    selectControl,
    editContainerProperties,
    editControlProperties,
    updateControlLocally,
    updateContainerLocally,
    moveControlFromSide,
    moveControl,
    saveForm,
    // updateForm,
    setCurrentFormName,
    saveFormName,
    publishForm,
    populateSignatureFields,
    clearContainerFields,
    selectedTemplate,
    formLayoutComponents,
    selectedControl,
    currentFormName,
  };
};

export default useFormBuilder;
