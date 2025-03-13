import { ToastProvider } from "./Providers/ToastProvider";
import { ATable } from "./table/table";

export default function App() {
  return (
    <ToastProvider>
      <ATable />
    </ToastProvider>
  );
}
