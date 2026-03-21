import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState,
} from "@tanstack/react-table";
import { Add, Search, WorkspacePremium, Visibility, VisibilityOff } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, FormHelperText, InputAdornment, FormControlLabel, Checkbox } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useMembers } from "../../../hooks/useMember";
import AppGlobal from "../../../ultis/global";
import API from "../../../api/api";
import { Member } from "../../../models/member";
import AppBarComponent from "../../../components/appBar";
import ThemedText from "../../../components/themedText";
import useIsMobile from "../../../hooks/useIsMobile";
import { validatePassword } from "../../../ultis/passwordValidation";

function MembersPage() {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterVipOnly, setFilterVipOnly] = useState(false);
    const { data } = useMembers(page, pageSize, searchTerm, filterVipOnly);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string>();
    const [editId, setEditId] = useState<string>();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        price: "",
        date: "",
        ageRange: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isVip, setIsVip] = useState(false);
    const [vipDuration, setVipDuration] = useState("");
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        price: "",
        date: "",
        ageRange: "",
    });

    const applyVipDuration = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setFormData((prev) => ({ ...prev, date: d.toISOString().split("T")[0] }));
    };

    const validateForm = () => {
        let isValid = true;
        const tempErrors = { email: "", password: "", price: "", date: "", ageRange: "" };
        if (!formData.email) {
            tempErrors.email = "請輸入電子郵件";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            tempErrors.email = "請輸入有效的電子郵件";
            isValid = false;
        }
        if (!editId) {
            const pwError = validatePassword(formData.password);
            if (pwError) {
                tempErrors.password = pwError;
                isValid = false;
            }
        } else if (formData.password) {
            const pwError = validatePassword(formData.password);
            if (pwError) {
                tempErrors.password = pwError;
                isValid = false;
            }
        }
        if (!formData.price) {
            tempErrors.price = "請輸入價格";
            isValid = false;
        } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            tempErrors.price = "請輸入有效的價格";
            isValid = false;
        }
        if (isVip && !formData.date) {
            tempErrors.date = "請選擇 VIP 到期日期";
            isValid = false;
        }
        if (!formData.ageRange) {
            tempErrors.ageRange = "請選擇廣告來源";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleFormSubmit = async () => {
        if (validateForm()) {
            try {
                if (editId) {
                    const res = await API.PUT(`${AppGlobal.baseURL}admin/member/${editId}`, formData);
                    if (res.status == 200) {
                        handleDialogClose();
                        await queryClient.refetchQueries({ queryKey: ["members"] });
                        toast.success("🎉 " + t("memberEditedSuccessfully"));
                    } else if (res.status == 409) {
                        alert(res.data.error);
                    }
                } else {
                    const res = await API.POST(`${AppGlobal.baseURL}admin/member`, formData);
                    if (res.status == 200) {
                        handleDialogClose();
                        await queryClient.refetchQueries({ queryKey: ["members"] });
                        toast.success("🎉 " + t("memberAddedSuccessfully"));
                    } else if (res.status == 409) {
                        alert(res.data.error);
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    const columns: ColumnDef<Member>[] = [
        {
            accessorKey: "email",
            header: () => <span className="sm:text-base text-xs font-medium">{t("email")}</span>,
            cell: (props: any) => (
                <span className="sm:text-base text-xs">{props.getValue()}</span>
            ),
        },
        {
            accessorKey: "date",
            header: () => <span className="sm:text-base text-[10px] font-medium">{"VIP到期時間"}</span>,
            cell: (props: any) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                    {(() => {
                        const value = props.getValue();
                        const days = value ? getDays(value) : null;
                        return days !== null && days > 0 ? (
                            <span className="bg-green-500 text-white sm:px-4 sm:py-2 px-2 py-1 rounded shadow font-bold text-center inline-block min-w-[70px]">
                                {days + "天"}
                            </span>
                        ) : undefined;
                    })()}
                </Box>
            ),
        },
        {
            accessorKey: "ageRange",
            header: () => <span className="sm:text-base text-xs font-medium">{"廣告來源"}</span>,
            cell: (props: any) => (
                <span className="sm:text-base text-[8px]">{props.getValue()}</span>
            ),
        },
        ...(!isMobile
            ? [
                {
                    accessorKey: "created_at",
                    header: () => (
                        <span className="sm:text-base text-xs font-medium">
                            {t("createdAt")}
                        </span>
                    ),
                    cell: (props: any) => {
                        const date = props.getValue();
                        const formattedDate = format(
                            new Date(date),
                            "yyyy年M月d日(E)",
                            {
                                locale: zhTW,
                            }
                        );
                        return formattedDate;
                    },
                },
            ]
            : []),
        {
            accessorKey: "operation",
            header: () => (
                <span className="sm:text-base text-xs font-medium">{t("operation")}</span>
            ),
            cell: (props: any) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title={t("edit")}>
                        <IconButton
                            aria-label={t("edit")}
                            onClick={() => handleEdit(props.row.original)}
                        >
                            <EditIcon sx={{ fontSize: "1rem", color: "white" }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("delete")}>
                        <IconButton
                            aria-label={t("delete")}
                            onClick={() => handleDelete(props.row.original.id)}
                        >
                            <DeleteIcon sx={{ fontSize: "1rem", color: "white" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
            size: 100,
        },
    ];

    function getDays(date: any) {
        const hoje = new Date();
        const alvo = new Date(date);
        if (isNaN(alvo.getTime())) return null;
        const diffTime = alvo.getTime() - hoje.getTime();
        const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDias > 0 ? diffDias : null;
    }
    const displayData = data?.data || [];

    const table = useReactTable({
        data: displayData,
        columns,
        pageCount: Math.ceil((data?.total || 0) / pageSize),
        state: {
            pagination: { pageIndex: page - 1, pageSize },
            sorting,
        },
        manualPagination: true,
        onPaginationChange: updater => {
            const newPagination = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize }) : updater;
            setPage(newPagination.pageIndex + 1);
            setPageSize(newPagination.pageSize);
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleDialogCloseDelete = () => {
        setDeleteId(undefined);
    }

    const handleOnDelete = async () => {
        const res = await API.DELETE(`${AppGlobal.baseURL}admin/member/${deleteId}`);
        if (res.status == 200) {
            handleDialogCloseDelete();
            await queryClient.refetchQueries({ queryKey: ["members"] });
            toast.success(t("memberDeletedSuccessfully"));
        } else if (res.status == 409) {
            alert(res.data.error);
        }
    }

    const handleDialogClose = () => {
        setFormData({ email: "", password: "", price: "", date: "", ageRange: "" });
        setErrors({ email: "", password: "", price: "", date: "", ageRange: "" });
        setShowPassword(false);
        setIsVip(false);
        setVipDuration("");
        setOpenDialog(false);
        setEditId(undefined);
    };

    const handleDialogOpen = () => {
        setIsVip(false);
        setVipDuration("");
        setOpenDialog(true);
    };

    const handleEdit = (e: Member) => {
        setEditId(e.id);
        const hasVip = !!(e.date && e.price && new Date(e.date) > new Date());
        setIsVip(hasVip);
        setVipDuration("");
        setFormData({
            email: e.email,
            password: "",
            price: e.price || "",
            date: e.date || "",
            ageRange: e.ageRange || "",
        });
        setOpenDialog(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    return (
        <div className="h-screen w-screen overflow-x-hidden bg-black">
            <ToastContainer position="top-right" autoClose={3000} />

            <AppBarComponent />

            <div className="mt-24 flex justify-center">
                <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-5/6">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "16px" }}>
                        <ThemedText type="defaultSemiBold" className="text-xl" colorText="white">
                            {t("member")}
                        </ThemedText>
                        <button
                            style={{ border: "none", cursor: "pointer" }}
                            className="bg-black hover:bg-opacity-80 transition duration-200"
                            onClick={handleDialogOpen}
                        >
                            <Add className="text-white text-2xl" />
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                flex: 1,
                                maxWidth: "400px",
                            }}
                        >
                            <Search sx={{ color: "white", marginRight: "8px" }} />
                            <TextField
                                placeholder="搜尋會員 (電子郵件或年齡範圍)..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to first page when searching
                                }}
                                variant="standard"
                                InputProps={{
                                    disableUnderline: true,
                                    sx: {
                                        color: "white",
                                        "&::placeholder": {
                                            color: "rgba(255, 255, 255, 0.5)",
                                        },
                                    },
                                }}
                                sx={{
                                    flex: 1,
                                    "& .MuiInputBase-input": {
                                        color: "white",
                                    },
                                }}
                            />
                        </Box>
                        <Tooltip title={filterVipOnly ? "顯示全部會員" : "只顯示 VIP"}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                setFilterVipOnly((prev) => !prev);
                                setPage(1);
                            }}
                                sx={{
                                    minWidth: "48px",
                                    height: "48px",
                                    borderRadius: "8px",
                                    backgroundColor: filterVipOnly ? "green" : "rgba(255, 255, 255, 0.1)",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: filterVipOnly ? "darkgreen" : "rgba(255, 255, 255, 0.2)",
                                    },
                                }}
                            >
                                <WorkspacePremium />
                            </Button>
                        </Tooltip>
                    </div>

                    <div className="overflow-x-auto -mx-2">
                    <table className="w-full border-collapse text-white min-w-[480px]">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="border-b border-gray-600 p-3 cursor-pointer font-bold text-base text-left"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: " 🔼",
                                                desc: " 🔽",
                                            }[header.column.getIsSorted() as string] ?? ""}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>


                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-700 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="sm:p-3 p-3 border-b border-gray-600">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-white">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="bg-gray-700 px-3 py-1 rounded disabled:opacity-50"
                        >
                            {t("previous")}
                        </button>
                        <span>{t("page")} {page}</span>
                        <button
                            disabled={page * pageSize >= (data?.total || 0)}
                            onClick={() => setPage(p => p + 1)}
                            className="bg-gray-700 px-3 py-1 rounded disabled:opacity-50"
                        >
                            {t("next")}
                        </button>
                    </div>
                </div>
            </div>


            <Dialog
                open={deleteId ? true : false}
                onClose={handleDialogCloseDelete}
                sx={{
                    "& .MuiDialog-paper": {
                        backgroundColor: "white",
                        color: "white",
                        margin: 10,
                        borderRadius: "8px",
                    }
                }}
            >
                <DialogTitle style={{ color: "black" }}>
                    {t("areYouSureDelete")}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleDialogCloseDelete} color="secondary">
                        {t("no")}
                    </Button>
                    <Button onClick={handleOnDelete} color="primary">
                        {t("yes")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                sx={{
                    "& .MuiDialog-paper": {
                        backgroundColor: "white",
                        color: "white",
                        margin: 10,
                        borderRadius: "8px",
                    }
                }}
            >
                <DialogTitle style={{ color: "black" }}>
                    {editId ? "編輯會員" : "新增會員"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label={t("email")}
                        fullWidth
                        margin="normal"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />
                    <TextField
                        label={editId ? "新密碼（留空則不修改）" : t("password")}
                        fullWidth
                        margin="normal"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                    {/* Platform source */}
                    <FormControl fullWidth margin="normal" error={!!errors.ageRange}>
                        <InputLabel id="platform-label">哪一個地方看到廣告？</InputLabel>
                        <Select
                            labelId="platform-label"
                            label="哪一個地方看到廣告？"
                            value={formData.ageRange}
                            onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                        >
                            <MenuItem value="FACEBOOK">Facebook</MenuItem>
                            <MenuItem value="INSTAGRAM">Instagram</MenuItem>
                            <MenuItem value="THREADS">Threads</MenuItem>
                        </Select>
                        {errors.ageRange && <FormHelperText>{errors.ageRange}</FormHelperText>}
                    </FormControl>

                    {/* Price */}
                    <TextField
                        label={t("price")}
                        fullWidth
                        margin="normal"
                        type="number"
                        value={formData.price}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*\.?\d{0,2}$/.test(value)) {
                                setFormData({ ...formData, price: value });
                            }
                        }}
                        error={Boolean(errors.price)}
                        helperText={errors.price}
                    />

                    {/* VIP toggle */}
                    <div className="mt-4 mb-2">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isVip}
                                    onChange={(e) => {
                                        setIsVip(e.target.checked);
                                        if (!e.target.checked) {
                                            setFormData((prev) => ({ ...prev, date: "" }));
                                            setVipDuration("");
                                        }
                                    }}
                                    sx={{ color: "black", "&.Mui-checked": { color: "green" } }}
                                />
                            }
                            label={<span className="font-semibold text-black">設為 VIP 會員</span>}
                        />
                    </div>

                    {/* VIP duration — only visible when VIP is checked */}
                    {isVip && (
                        <>
                            <p className="text-sm text-gray-500 mt-1 mb-2">VIP 時長</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {[
                                    { label: "7天", days: 7 },
                                    { label: "14天", days: 14 },
                                    { label: "30天", days: 30 },
                                    { label: "90天", days: 90 },
                                    { label: "180天", days: 180 },
                                    { label: "365天", days: 365 },
                                ].map((opt) => (
                                    <button
                                        key={opt.days}
                                        type="button"
                                        onClick={() => {
                                            setVipDuration(String(opt.days));
                                            applyVipDuration(opt.days);
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                            vipDuration === String(opt.days)
                                                ? "bg-green-600 text-white border-green-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            <TextField
                                label="VIP 到期日期"
                                fullWidth
                                margin="normal"
                                type="date"
                                value={formData.date ?? ""}
                                onChange={(e) => {
                                    setFormData({ ...formData, date: e.target.value });
                                    setVipDuration("");
                                }}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    htmlInput: { min: new Date().toISOString().split("T")[0] },
                                }}
                                error={Boolean(errors.date)}
                                helperText={errors.date}
                            />

                            {formData.date && new Date(formData.date) > new Date() && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">
                                        VIP {Math.ceil((new Date(formData.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天
                                    </span>
                                </div>
                            )}
                        </>
                    )}


                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleFormSubmit} color="primary">
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MembersPage;
