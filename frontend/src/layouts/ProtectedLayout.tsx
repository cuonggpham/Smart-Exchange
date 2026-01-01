import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const ProtectedLayout = () => {
    return (
        <ProtectedRoute>
            <Outlet />
        </ProtectedRoute>
    );
};