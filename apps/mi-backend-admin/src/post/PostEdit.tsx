import * as React from "react";
import { Edit, SimpleForm, EditProps, TextInput, DateInput, ReferenceInput, SelectInput } from "react-admin";

import { UserTitle } from "../user/UserTitle";
// Nota: El campo weather es gestionado por el backend; no debería editarse manualmente.

export const PostEdit = (props: EditProps): React.ReactElement => {
  // Eliminar el campo weather del payload si viene vacío para evitar errores GraphQL en updates
  const transform = (data: any) => {
    if (!data?.weather || !data?.weather?.id) {
      const { weather, ...rest } = data ?? {};
      return rest;
    }
    return data;
  };

  return (
    <Edit {...props} transform={transform}>
      <SimpleForm>
        <TextInput label="content" multiline source="content" />
        <DateInput label="date" source="date" />
        <TextInput label="title" source="title" />
        <ReferenceInput source="user.id" reference="User" label="user">
          <SelectInput optionText={UserTitle} />
        </ReferenceInput>
        {/* El campo weather se muestra/gestiona desde el backend; no editable aquí */}
      </SimpleForm>
    </Edit>
  );
};
