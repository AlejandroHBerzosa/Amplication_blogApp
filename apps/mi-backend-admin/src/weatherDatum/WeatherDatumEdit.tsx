import * as React from "react";
import {
  Edit,
  SimpleForm,
  EditProps,
  ReferenceInput,
  SelectInput,
} from "react-admin";
import { PostTitle } from "../post/PostTitle";

export const WeatherDatumEdit = (props: EditProps): React.ReactElement => {
  return (
    <Edit {...props}>
      <SimpleForm>
        <div />
        <ReferenceInput source="posts.id" reference="Post" label="Posts">
          <SelectInput optionText={PostTitle} />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
};
