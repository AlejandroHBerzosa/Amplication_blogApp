import * as React from "react";

import { Create, SimpleForm, CreateProps, TextInput, DateInput, ReferenceInput, SelectInput } from "react-admin";

import { UserTitle } from "../user/UserTitle";
// Nota: El campo weather se gestiona automáticamente por el backend vía eventos Redis
// y no debe enviarse al crear un Post.

export const PostCreate = (props: CreateProps): React.ReactElement => {
  // Eliminar el campo weather del payload si viene vacío para evitar errores GraphQL
  const transform = (data: any) => {
    if (!data?.weather || !data?.weather?.id) {
      const { weather, ...rest } = data ?? {};
      return rest;
    }
    return data;
  };

  return (
    <Create {...props} transform={transform}>
      <SimpleForm>
        <TextInput label="content" multiline source="content" />
        <DateInput label="date" source="date" />
        <TextInput label="title" source="title" />
        <ReferenceInput source="user.id" reference="User" label="user">
          <SelectInput optionText={UserTitle} />
        </ReferenceInput>
        {/* El campo weather se crea automáticamente en background, no se edita aquí */}
      </SimpleForm>
    </Create>
  );
};
