import { FormControlNames } from "./formBuilderUtils";

interface ConvertPropsType {
  [key: string]: any; // Placeholder for unknown properties
}

const controllNameMap = {
  [FormControlNames.INPUTTEXTFIELD]: "TEXT",
  [FormControlNames.RADIOGROUP]: "RADIO",
  [FormControlNames.DATEFIELD]: "DATETIME",
  [FormControlNames.SELECTDROPDOWN]: "SELECT",
  [FormControlNames.SIGNATURE]: "SIGNATURE",
};

const convertChild = (child: any) => {
  const newChild: any = {};

  if (child.controlName) newChild.type = controllNameMap[child.controlName];
  if (child.placeholder) newChild.placeholder = child.placeholder;
  if (child.labelName) newChild.label = child.labelName;
  if (child.name) newChild.name = child.name;
  if (child.items) newChild.options = child.items;
  newChild.sequence = Number(child.sequence || "0");
  newChild.information = child.description || "";
  newChild.required = child.required || false;
  newChild.version = "1.1";

  return newChild;
};

export const convert = (data: ConvertPropsType[]) => {
  const newData: any = {};
  newData.blocks = [];

  if (data.length) {
    for (const item of data as ConvertPropsType[]) {
      const newItem: any = {};
      newItem.title = item.container.heading;
      newItem.fields = [];
      newItem.type = item.container.type;
      newItem.skipAble = item.container.skipAble
        ? item.container.skipAble
        : false;

      if ((item as any).children && (item as any).children.length) {
        for (const itemChild of (item as any).children) {
          newItem.fields.push(convertChild(itemChild));
        }
      }

      newData.blocks.push({ ...newItem });
    }
  }

  return newData;
};
