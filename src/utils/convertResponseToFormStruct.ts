import { Form } from "../types/ResponseFormTypes";

function currentDateTime(date: string): string {
  return new Date(date).toISOString();
}

function convertToRequest(data: any) {
  const converted = {
    type: convertControlNameReverse(data.controlName),
    id: data.id,
    name: data.name,
    required: data.required,
    placeholder: data.placeholder,
    label: data.labelName,
    information: data.description,
    sequence: data.sequence,

    ...(data.items
      ? {
          options: data.items.map((option: any) => ({
            id: option.id,
            value: option.value,
            label: option.label,
          })),
        }
      : {}),
  };

  return converted;
}

function convertContainerToRequest(data: any) {
  const converted = {
    id: data?.container?.id,
    title: data?.container?.heading,
    type: data?.container?.type,
    skipAble: data?.container?.skipAble,
    sequence: data?.container?.sequence,
    fields: data?.children?.map((child: any) => convertToRequest(child)) || [],
  };

  return converted;
}

function convertForm(input: Form) {
  const converted = {
    id: input.id,
    formId: input.formId,
    formName: input.formName,
    file: input.pdf,
    createdAt: currentDateTime(input.creationDate),
    creator: "Test User",
    formLayoutComponents: input.blocks.map((block) => ({
      container: {
        id: block.id,
        controlName: "step-container",
        displayText: "Block",
        itemType: "container",
        icon: "fa fa-building",
        heading: block.title,
        subHeading: "",
        sequence: block.sequence,
        skipAble: block.skipAble,
        type: block.type,
      },
      children: block.fields.map((field) => ({
        id: field.id,
        controlName: convertControlName(field.type),
        displayText: field.label,
        description: field.information || "",
        placeholder: field.placeholder || "",
        labelName: field.label,
        itemType: "control",
        icon: getIconForControl(field.type),
        required: field.required,
        category: getCategoryForControl(field.type),
        containerId: block.id,
        name: field.name,
        sequence: field.sequence,
        ...(field.options
          ? {
              items: field.options.map((option) => ({
                id: option.id,
                value: option.value,
                label: option.label,
              })),
            }
          : {}),
      })),
    })),
    lastPublishedAt: currentDateTime(input.modificationDate),
    publishHistory: [],
    publishStatus: "saved",
    updatedAt: currentDateTime(input.modificationDate),
  };

  return converted;
}

function convertControlName(type: string): string {
  switch (type) {
    case "SIGNATURE":
      return "signature";
    case "SELECT":
      return "select-drop-down";
    case "DROPDOWN":
      return "select-drop-down";
    case "INFORMATION":
      return "information";
    case "DATETIME":
      return "date-field";
    case "TEXT":
      return "text-field";
    case "CHECKBOX":
      return "checkbox";
    case "RADIO":
      return "radio-group";
    case "FILE":
      return "file-upload";
    case "IMAGE":
      return "image-upload";
    case "CHECKBOX":
      return "checkbox";
    default:
      return "unknown";
  }
}

function getIconForControl(type: string): string {
  switch (type) {
    case "SIGNATURE":
      return "fa fa-signature";
    case "SELECT":
      return "fa fa-users";
    case "INFORMATION":
      return "fa fa-info-circle";
    case "DATETIME":
      return "fa fa-calendar";
    case "TEXT":
      return "fa fa-user";
    case "CHECKBOX":
      return "fa fa-check-square";
    default:
      return "fa fa-question-circle";
  }
}

function getCategoryForControl(type: string): string {
  switch (type) {
    case "SIGNATURE":
      return "other-elements";
    case "CHECKBOX":
      return "other-elements";
    case "INFORMATION":
      return "other-elements";
    case "SELECT":
      return "dropdown-elements";
    case "DATETIME":
      return "date-elements";
    case "TEXT":
      return "text-elements";
    default:
      return "unknown-elements";
  }
}

function getControlsForCategory(category: string): string[] {
  switch (category) {
    case "other-elements":
      return ["SIGNATURE", "CHECKBOX", "INFORMATION"];
    case "dropdown-elements":
      return ["SELECT"];
    case "date-elements":
      return ["DATETIME"];
    case "text-elements":
      return ["TEXT"];
    case "unknown-elements":
      return ["UNKNOWN"];
    default:
      return [];
  }
}

function convertControlNameReverse(controlName: string): string {
  switch (controlName) {
    case "signature":
      return "SIGNATURE";
    case "select-drop-down":
      return "SELECT";
    case "information":
      return "INFORMATION";
    case "date-field":
      return "DATETIME";
    case "text-field":
      return "TEXT";
    case "checkbox":
      return "CHECKBOX";
    case "radio-group":
      return "RADIO";
    case "file-upload":
      return "FILE";
    case "image-upload":
      return "IMAGE";
    case "unknown":
      return "UNKNOWN";
    default:
      return "";
  }
}

export { convertToRequest, convertContainerToRequest };
export default convertForm;
