import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Feedback from "@/pages/Feedback";
import NotFound from "@/pages/not-found";

function Router() {
    return (
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/feedback" component={Feedback} />
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <Router />
                <Toaster richColors position="top-right" />
            </LanguageProvider>
        </QueryClientProvider>
    );
}

export default App;
