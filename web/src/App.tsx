import { QueryClientProvider, QueryClient } from "@tanstack/solid-query";
import { Router, Route } from "@solidjs/router";
import LoginPage from "./pages/login-page";
import RegisterPage from "./pages/register-page";
import DashboardPage from "./pages/dashboard-page";
import RolesPage from "./pages/roles-page";
import HealthPage from "./pages/health-page";
import { ProtectedRoute } from "./components/protected-route";

const ProtectedDashboard = () => <ProtectedRoute><DashboardPage /></ProtectedRoute>;
const ProtectedRoles = () => <ProtectedRoute><RolesPage /></ProtectedRoute>;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/roles" component={ProtectedRoles} />
        <Route path="/health" component={HealthPage} />
        <Route path="/" component={ProtectedDashboard} />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
