import { Switch, Route, useLocation, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import ActionItems from "@/pages/action-items";
import CannedResponses from "@/pages/canned-responses";
import Automations from "@/pages/automations";
import Leaderboard from "@/pages/leaderboard";
import Accessibility from "@/pages/accessibility";
import { getCurrentTheme } from "@/lib/theme";
import { ExpieCharacter } from "@/components/ExpieCharacter";

function AuthenticatedRoute({ component: Component, ...rest }: any) {
  // Always consider the user as authenticated - no login required
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {/* Redirect from root to dashboard */}
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/dashboard">
        <AuthenticatedRoute component={Dashboard} />
      </Route>
      <Route path="/action-items">
        <AuthenticatedRoute component={ActionItems} />
      </Route>
      <Route path="/canned-responses">
        <AuthenticatedRoute component={CannedResponses} />
      </Route>
      <Route path="/automations">
        <AuthenticatedRoute component={Automations} />
      </Route>
      <Route path="/leaderboard">
        <AuthenticatedRoute component={Leaderboard} />
      </Route>
      <Route path="/accessibility">
        <AuthenticatedRoute component={Accessibility} />
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set theme based on user preference
  useEffect(() => {
    const currentTheme = getCurrentTheme();
    document.documentElement.classList.toggle('dark', localStorage.getItem('darkMode') === 'true');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <ExpieCharacter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
