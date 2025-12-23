import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store, persistor } from "@/app/store";
import { PersistGate } from "redux-persist/integration/react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import MobileBlocker from "@/components/common/MobileBlocker.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          {/* 모바일 차단 컴포넌트로 감싸기 */}
          <MobileBlocker>
              <RouterProvider router={router} />
          </MobileBlocker>
      </PersistGate>
    </Provider>
  </StrictMode>
);
