import { FileType } from "./FileType";

export interface ClientType {
  id: string;
  name: string;
  phone: string;
  email: string;
  file: FileType;
}
