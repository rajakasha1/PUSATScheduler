import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Schedules from "@/pages/schedules";
import Teachers from "@/pages/teachers";
import Courses from "@/pages/courses";
import Settings from "@/pages/settings";
import Sidebar from "@/components/sidebar";

function Router() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-x-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/schedules" component={Schedules} />
          <Route path="/teachers" component={Teachers} />
          <Route path="/courses" component={Courses} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
