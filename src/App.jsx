import { RouterProvider } from "react-router-dom";
import { router } from "./Router/router.jsx";
import { AppProvider } from "./Central_Store/app_context.jsx";

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;