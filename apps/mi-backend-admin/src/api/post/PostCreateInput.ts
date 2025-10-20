import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type PostCreateInput = {
  content: string;
  date?: Date | null;
  title: string;
  user?: UserWhereUniqueInput | null;
};
