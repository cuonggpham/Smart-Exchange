import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const PublicRoute = () => {
    const { user } = useAuth();

    // CHỈ redirect khi ĐÃ login
    if (user) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};
