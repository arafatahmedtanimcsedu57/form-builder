import React from "react";
import routes from "./utils/routes";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import BackdropCircularProgressComponent from "./components/BackdropCircularProgressComponent";
import ModalStrip from "./components/ModalStrip";
import { createPortal } from "react-dom";

function App() {
  const router = createBrowserRouter(routes);

  return (
    <>
      <Provider store={store}>
        <BackdropCircularProgressComponent />
        {createPortal(<ModalStrip />, document.body)}
        <RouterProvider router={router} />
      </Provider>
    </>
  );
}

export default App;
