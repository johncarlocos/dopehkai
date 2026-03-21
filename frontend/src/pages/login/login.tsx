import { useState } from "react";
import AppAssets from "../../ultis/assets";
import API from "../../api/api";
import AppGlobal from "../../ultis/global";
import useAuthStore from "../../store/userAuthStore";
import { useNavigate } from "react-router-dom";
import ThemedText from "../../components/themedText";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { validatePassword } from "../../ultis/passwordValidation";

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErro, setShowErro] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let isValid = true;
    const tempErrors = { email: "", password: "" };
    if (!email) {
      tempErrors.email = "請輸入電子郵件";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "請輸入有效的電子郵件";
      isValid = false;
    }
    const pwError = validatePassword(password);
    if (pwError) {
      tempErrors.password = pwError;
      isValid = false;
    }
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setShowErro(false);

    const data = {
      email: email,
      password: password
    };
    const res = await API.POST(AppGlobal.baseURL + "user/login", data);
    if (res.status === 200) {
      const role = res.data?.role ?? res.data?.user?.role;
      // Backend sets the cookie via Set-Cookie header (same origin in production).
      // For cross-origin dev (frontend :5173, backend :4000), the browser may not
      // save the Set-Cookie, so set it via js-cookie as a fallback.
      const raw = res.data?.sessionId;
      const sessionIdStr =
        typeof raw === "string"
          ? raw
          : raw && typeof raw === "object" && typeof (raw as { token?: string }).token === "string"
            ? (raw as { token: string }).token
            : null;
      if (sessionIdStr) {
        const isAdmin = role === "admin" || role === "subadmin";
        Cookies.set("sessionId", sessionIdStr, {
          sameSite: "lax",
          path: "/",
          expires: isAdmin ? 365 : 30,
        });
      }
      if (role) login(role);
      navigate("/");
    } else {
      setShowErro(true);
    }
    setLoading(false);
  };


  return (
    <div className="overflow-hidden h-screen w-screen flex items-center justify-center bg-black" >
      <div className="w-full max-w-2xl p-8 items-center">
        <div className="w-full max-w-2xl sm:p-8 p-4 space-y-4 rounded-lg shadow-xl">
          <div className="flex justify-center ">
            <img src={AppAssets.logo} alt="Logo"
              className="h-44 flex justify-center mb-0 " />
          </div>
          <div className="bg-white sm:p-10 p-7 rounded-xl">

            <div className="flex items-start w-full">
              <div className="w-2 bg-black mr-2 self-stretch" />
              <div className="flex flex-col justify-center space-y-2 text-black">
                <p className="sm:text-2xl text-base sm:h-7 h-6 font-bold">
                  {t("login").toUpperCase()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-10">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600"> {t('email')}</label>
                <TextField
                  type="email"
                  id="email"
                  name="email"
                  required={false}
                  className="w-full p-3 mt-2 bg-[#f7f7e3] text-black border rounded-md border-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={t('enterYourEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-600">{t('password')}</label>
                <TextField
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required={false}
                  className="w-full p-3 mt-2 bg-[#f7f7e3] text-black border rounded-md border-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={t('輸入您的密碼')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              {showErro ?
                <div className="bg-black rounded-lg p-2 mt-2 flex-row flex items-center justify-center">
                  <ThemedText
                    className="font-bold text-[12px] sm:text-[16px] leading-tight"
                    type="defaultSemiBold"
                    style={{
                      color: "white",
                    }}
                  >
                    {t("invalidEmailOrPassword")}
                  </ThemedText>
                </div> : undefined
              }

              <button
                type="submit"
                className="w-full py-3 mt-12 text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 border-none"
                disabled={loading}
              >
                {loading ? t("loading") : t("login")}
              </button>

              <div className="mt-4 text-center">
                <a href="/forget-password" className="text-sm text-black hover:underline">{t("forgotPassword")}</a>
              </div>

              <div className="mt-4 text-center">
                <a href="/register" className="text-sm text-black hover:underline">{t("register")}</a>
              </div>


            </form>
          </div>
        </div>
      </div>
    </div>

  );
}

export default LoginPage;
