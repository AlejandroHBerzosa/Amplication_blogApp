import React, { useEffect, useState } from "react";
import { Admin, DataProvider, Resource } from "react-admin";
import dataProvider from "./data-provider/graphqlDataProvider";
import { theme } from "./theme/theme";
import Login from "./Login";
import "./App.scss";
import Dashboard from "./pages/Dashboard";
import { WeatherDatumList } from "./weatherDatum/WeatherDatumList";
import { WeatherDatumCreate } from "./weatherDatum/WeatherDatumCreate";
import { WeatherDatumEdit } from "./weatherDatum/WeatherDatumEdit";
import { WeatherDatumShow } from "./weatherDatum/WeatherDatumShow";
import { jwtAuthProvider } from "./auth-provider/ra-auth-jwt";

const App = (): React.ReactElement => {
  return (
    <div className="App">
      <Admin
        title={"weatherData"}
        dataProvider={dataProvider}
        authProvider={jwtAuthProvider}
        theme={theme}
        dashboard={Dashboard}
        loginPage={Login}
      >
        <Resource
          name="WeatherDatum"
          list={WeatherDatumList}
          edit={WeatherDatumEdit}
          create={WeatherDatumCreate}
          show={WeatherDatumShow}
        />
      </Admin>
    </div>
  );
};

export default App;
