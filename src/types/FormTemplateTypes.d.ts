import { FileType } from "./FileType";

export interface TemplateType {
  formName: string;
  id?: string;
  formId: number;
  createdAt: string;
  updatedAt: string;
  lastPublishedAt: string;
  publishStatus: string;
  formLayoutComponents: FormLayoutComponentsType[];
  publishHistory: FormLayoutHistoryType[];
  creator: string;
  file: FileType | null;
}

export interface TemplatePaginationType {
  content: TemplateType[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

export interface FormLayoutComponentsType {
  container: FormLayoutComponentContainerType;
  children: FormLayoutComponentChildrenType[];
}

export interface FormLayoutHistoryType {
  lastPublishedAt: string;
  formLayoutComponents: FormLayoutComponentsType[];
}

interface FormLayoutComponentContainerType {
  controlName: string;
  displayText: string;
  itemType: string;
  icon: string;
  heading: string;
  subHeading: string;
  id?: string;
  desktopWidth?: number;
  skipAble?: boolean;
  type?: string;
  sequence: number;
  internalId?: string;
}

interface FormLayoutComponentChildrenType {
  controlName: string;
  displayText: string;
  description: string;
  labelName: string;
  itemType: string;
  icon: string;
  required: boolean;
  items?: FormLayoutComponentChildrenItemsType[];
  category: string;
  index?: number;
  id?: string;
  internalId?: string;
  containerId: string;
  placeholder?: string;
  rows?: number;
  dataType?: string;
  position?: number;
  name: string;
  sequence: number;
}

interface FormLayoutComponentChildrenItemsType {
  id: string;
  value: string;
  label: string;
}
