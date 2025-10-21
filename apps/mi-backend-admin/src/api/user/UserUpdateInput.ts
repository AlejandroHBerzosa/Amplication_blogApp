import { PostUpdateManyWithoutUsersInput } from "./PostUpdateManyWithoutUsersInput";
import { InputJsonValue } from "../../types";

export type UserUpdateInput = {
  email?: string;
  password?: string;
  posts?: PostUpdateManyWithoutUsersInput;
  roles?: InputJsonValue;
  username?: string | null;
};
