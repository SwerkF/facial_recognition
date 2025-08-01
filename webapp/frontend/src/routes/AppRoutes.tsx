import { useAutoLogin } from '@/api/queries/authQueries';
import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';

import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Sidebar from '@/components/layout/Sidebar';
import Loader from '@/components/ui/Loader/Loader';

import Error from '@/features/Error';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import FaceVerification from '@/features/face-verification/FaceVerification';
import AdminFaceVerification from '@/features/face-verification/AdminFaceverification';

import { useAuthStore } from '@/stores/authStore';

const AppRoutes = () => {
    const { isAuthenticated } = useAuthStore();

    const { refetch: autoLogin, isPending } = useAutoLogin();

    useEffect(() => {
        autoLogin();
    }, [autoLogin]);

    if (isPending) {
        return <Loader />;
    }

    return (
        <div className="flex min-h-screen flex-col">
            {isAuthenticated && <Sidebar />}
            <main className="flex-grow">
                <Routes>
                    {/* Routes publiques */}
                    <Route element={<PublicRoutes />}>
                        {/* <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} /> */}
                        <Route path="/" element={<FaceVerification />} />
                        <Route path="/admin/face-verification" element={<AdminFaceVerification />} />
                    </Route>

                    {/* Routes privées */}
                    <Route element={<PrivateRoutes />}>
                    </Route>

                    {/* Route par défaut */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                    <Route path="/error" element={<Error />} />
                </Routes>
            </main>
        </div>
    );
};

export default AppRoutes;
