import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export const ProtectedLayout = () => {
    return (
        <ProtectedRoute>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Outlet />
                </main>
                <BottomNav />
            </div>
        </ProtectedRoute>
    );
};