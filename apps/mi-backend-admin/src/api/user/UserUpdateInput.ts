import { PostUpdateManyWithoutUsersInput } from "./PostUpdateManyWithoutUsersInput";

export type UserUpdateInput = {
  email?: string;
  password?: string;
  posts?: PostUpdateManyWithoutUsersInput;
  username?: string | null;
};
