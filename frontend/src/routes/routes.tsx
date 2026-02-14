import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import useAuthStore from "../store/userAuthStore";
import { Loading } from "../components/loading";

// Lazy load pages for code splitting and faster initial load
const HomePage = lazy(() => import("../pages/home/home"));
const MatchsPage = lazy(() => import("../pages/matchs/matchs"));
const DetailsMatchPage = lazy(() => import("../pages/details_match/details_match"));
const LoginPage = lazy(() => import("../pages/login/login"));
const ForgetPasswordPage = lazy(() => import("../pages/forget_password/forget_password"));
const RegisterPage = lazy(() => import("../pages/register/register"));
const MembersPage = lazy(() => import("../pages/admin/member/member"));
const AdminsPage = lazy(() => import("../pages/admin/admins/admins"));
const RecordsAdminPage = lazy(() => import("../pages/admin/records/records"));
const Records2AdminPage = lazy(() => import("../pages/admin/records2/records2"));
const RecordsPage = lazy(() => import("../pages/records/records"));
const Records2Page = lazy(() => import("../pages/records2/records2"));
const TermsPage = lazy(() => import("../pages/terms/terms"));

const AppRoutes = () => {
    const { userRole } = useAuthStore();
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forget-password" element={<ForgetPasswordPage />} />
                    <Route path="/records" element={<RecordsPage />} />
                    <Route path="/records2" element={<Records2Page />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {userRole ?
                        <Route path="/matches" element={<MatchsPage />} />
                        : undefined
                    }
                    {userRole ?
                        <Route path="/details-match/:id" element={<DetailsMatchPage />} />
                        : undefined
                    }


                    {userRole && (userRole === "admin" || userRole === "subadmin") ?
                        <Route path="/admin/members" element={<MembersPage />} />
                        : undefined
                    }
                    {userRole && (userRole === "admin" || userRole === "subadmin") ?
                        <Route path="/admin/admins" element={<AdminsPage />} />
                        : undefined
                    }
                    {userRole && (userRole === "admin" || userRole === "subadmin") ?
                        <Route path="/admin/records" element={<RecordsAdminPage />} />
                        : undefined
                    }
                    {userRole && (userRole === "admin" || userRole === "subadmin") ?
                        <Route path="/admin/records2" element={<Records2AdminPage />} />
                        : undefined
                    }

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default AppRoutes;