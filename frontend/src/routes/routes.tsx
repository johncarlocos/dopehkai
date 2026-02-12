import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import MatchsPage from "../pages/matchs/matchs";
import DetailsMatchPage from "../pages/details_match/details_match";
import LoginPage from "../pages/login/login";
import ForgetPasswordPage from "../pages/forget_password/forget_password";
import useAuthStore from "../store/userAuthStore";
import HomePage from "../pages/home/home";
import RegisterPage from "../pages/register/register";
import MembersPage from "../pages/admin/member/member";
import AdminsPage from "../pages/admin/admins/admins";
import RecordsAdminPage from "../pages/admin/records/records";
import Records2AdminPage from "../pages/admin/records2/records2";
import RecordsPage from "../pages/records/records";
import Records2Page from "../pages/records2/records2";
import TermsPage from "../pages/terms/terms";

const AppRoutes = () => {
    const { userRole } = useAuthStore();
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}

export default AppRoutes;