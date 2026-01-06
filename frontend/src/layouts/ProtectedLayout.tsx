import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";

export const ProtectedLayout = () => {
    return (
        <ProtectedRoute>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </ProtectedRoute>
    );
};