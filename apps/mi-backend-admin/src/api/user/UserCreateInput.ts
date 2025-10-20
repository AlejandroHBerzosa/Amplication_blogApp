import { PostCreateNestedManyWithoutUsersInput } from "./PostCreateNestedManyWithoutUsersInput";

export type UserCreateInput = {
  email: string;
  password: string;
  posts?: PostCreateNestedManyWithoutUsersInput;
  username?: string | null;
};
