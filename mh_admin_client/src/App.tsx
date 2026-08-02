import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { PrivateRoute } from "@/components/wrappers/PrivateRoute";
import { PublicRoute } from "@/components/wrappers/PublicRoute";
import { SidebarWrapper } from "@/components/wrappers/SidebarWrapper";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import ManageData from "@/pages/ManageData";
import Logs from "@/pages/Logs";
import Feedback from "@/pages/Feedback";

function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <SidebarWrapper title="Dashboard">
                                        <Dashboard />
                                    </SidebarWrapper>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/analytics"
                            element={
                                <PrivateRoute>
                                    <SidebarWrapper title="Analytics">
                                        <Analytics />
                                    </SidebarWrapper>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/manage-data"
                            element={
                                <PrivateRoute>
                                    <SidebarWrapper title="Manage Data">
                                        <ManageData />
                                    </SidebarWrapper>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/logs"
                            element={
                                <PrivateRoute>
                                    <SidebarWrapper title="Audit Logs">
                                        <Logs />
                                    </SidebarWrapper>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/feedback"
                            element={
                                <PrivateRoute>
                                    <SidebarWrapper title="Feedback">
                                        <Feedback />
                                    </SidebarWrapper>
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
                <Toaster richColors position="top-right" />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
