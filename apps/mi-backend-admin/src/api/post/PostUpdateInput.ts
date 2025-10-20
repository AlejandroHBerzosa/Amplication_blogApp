import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type PostUpdateInput = {
  content?: string;
  date?: Date | null;
  title?: string;
  user?: UserWhereUniqueInput | null;
};
