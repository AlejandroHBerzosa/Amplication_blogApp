import { PostCreateNestedManyWithoutUsersInput } from "./PostCreateNestedManyWithoutUsersInput";
import { InputJsonValue } from "../../types";

export type UserCreateInput = {
  email: string;
  password: string;
  posts?: PostCreateNestedManyWithoutUsersInput;
  roles?: InputJsonValue;
  username?: string | null;
};
