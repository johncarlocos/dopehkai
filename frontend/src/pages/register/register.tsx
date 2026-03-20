import { useState } from "react";
import AppAssets from "../../ultis/assets";
import API from "../../api/api";
import AppGlobal from "../../ultis/global";
import useAuthStore from "../../store/userAuthStore";
import { useNavigate, Link } from "react-router-dom";
import ThemedText from "../../components/themedText";
import { useTranslation } from "react-i18next";
import { FormControl, InputLabel, MenuItem, Select, TextField, Checkbox, FormControlLabel, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { validatePassword } from "../../ultis/passwordValidation";

function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [ageRange, setAgeRange] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        ageRange: "",
        terms: ""
    });

    const validateForm = () => {
        let isValid = true;
        const tempErrors = { email: "", password: "", confirmPassword: "", ageRange: "", terms: "" };
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
        if (!confirmPassword) {
            tempErrors.confirmPassword = "請確認密碼";
            isValid = false;
        } else if (password !== confirmPassword) {
            tempErrors.confirmPassword = "密碼不匹配";
            isValid = false;
        }
        if (!ageRange) {
            tempErrors.ageRange = "請選擇在哪裡看到廣告";
            isValid = false;
        }
        if (!agreedToTerms) {
            tempErrors.terms = "請同意服務條款";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };
    const [loading, setLoading] = useState(false);
    const [showErro, setShowErro] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (validateForm()) {
            const data = {
                email: email,
                ageRange: ageRange,
                password: password
            };
            const res = await API.POST(`${AppGlobal.baseURL}user/register`, data);
            if (res.status == 200) {
                const res = await API.POST(AppGlobal.baseURL + "user/login", data);
                if (res.status === 200) {
                    login(res.data.role);
                    navigate("/");
                } else {
                    setShowErro(true);
                }
            } else if (res.status == 409) {
                alert(res.data.error)
            }
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
                                    {t("register").toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 mt-10">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-600"> {t('email')}</label>
                                <TextField
                                    type="email"
                                    id="text"
                                    name="text"
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
                                    required={false}
                                    name="password"
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
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">確認密碼</label>
                                <TextField
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    required={false}
                                    name="confirmPassword"
                                    className="w-full p-3 mt-2 bg-[#f7f7e3] text-black border rounded-md border-black focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="再次輸入密碼"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={Boolean(errors.confirmPassword)}
                                    helperText={errors.confirmPassword}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </div>

                            <div>
                                <FormControl fullWidth required={false} error={Boolean(errors.ageRange)}>
                                    <InputLabel
                                        id="age-label">哪一個地方看到廣告?</InputLabel>
                                    <Select
                                        labelId="age-label"
                                        id="age"
                                        value={ageRange}
                                        onChange={(e) => setAgeRange(e.target.value)}
                                        className="bg-[#f7f7e3] text-black rounded-md mt-2 border-none"
                                    >
                                        <MenuItem value="FACEBOOK">FACEBOOK</MenuItem>
                                        <MenuItem value="INSTAGRAM">INSTAGRAM</MenuItem>
                                        <MenuItem value="THREADS">THREADS</MenuItem>
                                    </Select>
                                    {errors.ageRange && (
                                        <p className="text-red-500 text-xs mt-1">{errors.ageRange}</p>
                                    )}
                                </FormControl>
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

                            {/* Terms and Conditions Checkbox */}
                            <div className="mt-6">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={agreedToTerms}
                                            onChange={(e) => {
                                                setAgreedToTerms(e.target.checked);
                                                if (e.target.checked) {
                                                    setErrors({ ...errors, terms: "" });
                                                }
                                            }}
                                            sx={{
                                                color: 'black',
                                                '&.Mui-checked': {
                                                    color: 'black',
                                                },
                                                padding: '4px 9px',
                                                alignSelf: 'flex-start',
                                            }}
                                        />
                                    }
                                    label={
                                        <span className="text-sm text-gray-700 leading-relaxed flex items-center">
                                            點擊「註冊」即表示你同意我們的
                                            <Link 
                                                to="/terms" 
                                                target="_blank"
                                                className="text-blue-600 hover:text-blue-800 underline font-semibold ml-1"
                                            >
                                                《服務條款》
                                            </Link>
                                        </span>
                                    }
                                    sx={{
                                        alignItems: 'center',
                                        margin: 0,
                                        '& .MuiFormControlLabel-label': {
                                            marginLeft: '8px',
                                        }
                                    }}
                                />
                                {errors.terms && (
                                    <p className="text-red-500 text-xs mt-1 ml-8">{errors.terms}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 mt-6 text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 border-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                disabled={loading || !agreedToTerms}
                            >
                                {loading ? t("loading") : t("register")}
                            </button>

                            <div className="mt-4 text-center">
                                <a href="/login" className="text-sm text-black hover:underline">{"返回"}</a>
                            </div>


                        </form>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default RegisterPage;
