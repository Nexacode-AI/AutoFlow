import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WorkflowList from "./pages/WorkflowList";
import WorkflowDetail from "./pages/WorkflowDetail";
import WorkflowDetailPage from "./pages/WorkflowDetailPage";
import PartsManagement from "./pages/PartsManagement";
import Finance from "./pages/Finance";
import CreateWorkflowPage from "./pages/CreateWorkflowPage";
import ClientApprovalPage from "./pages/ClientApprovalPage";
import CustomerFeedbackPage from "./pages/CustomerFeedbackPage";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/client-approval",
    Component: ClientApprovalPage,
  },
  {
    path: "/customer-feedback",
    Component: CustomerFeedbackPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "workflows",
        Component: WorkflowList,
      },
      {
        path: "workflows/create",
        Component: CreateWorkflowPage,
      },
      {
        path: "workflows/:workflowId",
        Component: WorkflowDetailPage,
      },
      {
        path: "workflows/:id/edit",
        Component: WorkflowDetail,
      },
      {
        path: "parts",
        Component: PartsManagement,
      },
      {
        path: "finance",
        Component: Finance,
      },
    ],
  },
]);
