import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Doctors from "@/pages/Doctors";
import Records from "@/pages/Records";
import Medicines from "@/pages/Medicines";
import Profile from "@/pages/Profile";
import VideoConsultation from "@/pages/VideoConsultation";
import PharmacistDashboard from "@/pages/PharmacistDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/doctors" component={Doctors} />
      <Route path="/records" component={Records} />
      <Route path="/medicines" component={Medicines} />
      <Route path="/profile" component={Profile} />
      <Route path="/video/:roomId" component={VideoConsultation} />
      <Route path="/pharmacist" component={PharmacistDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <Layout>
              <Toaster />
              <Router />
            </Layout>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
