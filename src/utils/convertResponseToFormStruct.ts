type Option = {
  id: string;
  value: string;
  label: string;
};

type Field = {
  type: string;
  id: string;
  name: string;
  label: string;
  required: boolean;
  options?: Option[];
  placeholder?: string;
};

type Block = {
  id: string;
  title: string;
  type: string;
  sequence: number;
  fields: Field[];
  skipAble: boolean;
};

type Pdf = {
  id: string;
  fileName: string;
  contentType: string;
  creationDate: string;
  modificationDate: string;
};

type Form = {
  id: string;
  formId: number;
  formName: string;
  pdf: Pdf;
  blocks: Block[];
  creationDate: string;
  modificationDate: string;
};

function currentDateTime(date: string): string {
  return new Date(date).toISOString();
}

function convertForm(input: Form) {
  const converted = {
    id: input.id,
    formName: input.formName,
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
        skipAble: block.skipAble,
        type: "INPUT",
      },
      children: block.fields.map((field) => ({
        id: field.id,
        controlName: convertControlName(field.type),
        displayText: field.label,
        description: field.placeholder || "",
        labelName: field.label,
        itemType: "control",
        icon: getIconForControl(field.type),
        required: field.required,
        category: getCategoryForControl(field.type),
        containerId: field.id,
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

export default convertForm;
