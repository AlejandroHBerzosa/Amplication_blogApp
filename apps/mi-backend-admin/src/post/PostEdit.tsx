import * as React from "react";

import {
  Edit,
  SimpleForm,
  EditProps,
  TextInput,
  DateInput,
  ReferenceInput,
  SelectInput,
} from "react-admin";

import { UserTitle } from "../user/UserTitle";
import { WeatherDatumTitle } from "../weatherDatum/WeatherDatumTitle";

export const PostEdit = (props: EditProps): React.ReactElement => {
  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput label="content" multiline source="content" />
        <DateInput label="date" source="date" />
        <TextInput label="title" source="title" />
        <ReferenceInput source="user.id" reference="User" label="user">
          <SelectInput optionText={UserTitle} />
        </ReferenceInput>
        <ReferenceInput
          source="weather.id"
          reference="WeatherDatum"
          label="weather"
        >
          <SelectInput optionText={WeatherDatumTitle} />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
};
