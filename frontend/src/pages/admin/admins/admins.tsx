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
import { Add } from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, IconButton, Tooltip, FormControl, InputLabel, Select, FormHelperText, MenuItem, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { validatePassword } from "../../../ultis/passwordValidation";
import { useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import AppGlobal from "../../../ultis/global";
import API from "../../../api/api";
import { useAdmins } from "../../../hooks/useAdmins";
import { Member } from "../../../models/member";
import AppBarComponent from "../../../components/appBar";
import ThemedText from "../../../components/themedText";
import useAuthStore from "../../../store/userAuthStore";
import useIsMobile from "../../../hooks/useIsMobile";

function AdminsPage() {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([]);
    const { data } = useAdmins(page, pageSize);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string>();
    const [editId, setEditId] = useState<string>();
    const { userRole } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: ""
    });
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        role: ""
    });

    const validateForm = () => {
        let isValid = true;
        let tempErrors = { email: "", password: "", role: "" };
        if (!formData.email) {
            tempErrors.email = t("usernameRequired");
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            tempErrors.email = t("usernameRequired");
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
        if (!formData.role) {
            tempErrors.role = t("usernameRequired", "所需角色");
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };

    const handleFormSubmit = async () => {
        if (validateForm()) {
            try {
                if (editId) {
                    const res = await API.PUT(`${AppGlobal.baseURL}admin/admin/${editId}`, formData);
                    if (res.status == 200) {
                        handleDialogClose();
                        await queryClient.refetchQueries({ queryKey: ["admins"] });
                        toast.success("🎉 " + t("memberEditedSuccessfully"));
                    } else if (res.status == 409) {
                        alert(res.data.error);
                    }
                } else {
                    const res = await API.POST(`${AppGlobal.baseURL}admin/admin`, formData);
                    if (res.status == 200) {
                        handleDialogClose();
                        await queryClient.refetchQueries({ queryKey: ["admins"] });
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
            accessorKey: "role",
            header: () => <span className="sm:text-base text-xs font-medium">{"角色"}</span>,
            cell: (props: any) => (

                <Box sx={{ display: "flex", gap: 1 }}>
                    {(() => {
                        const role = props.getValue();
                        return role ? (
                            <span className="text-white sm:px-4 sm:py-2 px-1 py-1 rounded shadow text-xs text-center inline-block min-w-[90px]"
                                style={{ backgroundColor: role == "admin" ? "green" : "grey" }}>
                                {role.toUpperCase()}
                            </span>
                        ) : undefined;
                    })()}
                </Box>
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
        ...(userRole == "admin"
            ? [
                {
                    accessorKey: "operation",
                    header: () => <span className="sm:text-base text-xs font-medium">{t("operation")}</span>,
                    cell: (props: any) => {
                        const row = props.row.original;
                        const isSubadmin = row.role === "subadmin";
                        return (
                            <Box sx={{ display: "flex", gap: 1, minWidth: 80 }}>
                                {isSubadmin ? (
                                    <Tooltip title={t("edit")}>
                                        <IconButton
                                            aria-label={t("edit")}
                                            onClick={() => handleEdit(row)}
                                        >   
                                            <EditIcon sx={{ fontSize: "1rem", color: "white" }} />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <IconButton disabled sx={{ visibility: "hidden" }}>
                                        <EditIcon sx={{ fontSize: "1rem" }} />
                                    </IconButton>
                                )}
                                <Tooltip title={t("delete")}>
                                    <IconButton
                                        aria-label={t("delete")}
                                        onClick={() => handleDelete(row.id)}
                                    >
                                        <DeleteIcon sx={{ fontSize: "1rem", color: "white" }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        );
                    },
                },
            ]
            : []),



    ];

    const table = useReactTable({
        data: data?.data || [],
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
        const res = await API.DELETE(`${AppGlobal.baseURL}admin/admin/${deleteId}`);
        if (res.status == 200) {
            handleDialogCloseDelete();
            await queryClient.refetchQueries({ queryKey: ["admins"] });
            toast.success(t("memberDeletedSuccessfully"));
            return;
        } else if (res.status == 409) {
            alert(res.data.error);
        }
        handleDialogCloseDelete();
    }

    const handleDialogClose = () => {
        setFormData({
            email: "",
            password: "",
            role: "",
        })
        setErrors({
            email: "",
            password: "",
            role: "",
        })
        setShowPassword(false);
        setOpenDialog(false);
        setEditId(undefined);
    };

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };


    const handleEdit = (row: any) => {
        setEditId(row.id);
        setFormData({
            email: row.email,
            password: "",
            role: row.role || "",
        });
        setOpenDialog(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };



    return (
        <div className="h-screen w-screen sm:overflow-x-hidden bg-black">
            <ToastContainer position="top-right" autoClose={3000} />
            <AppBarComponent />
            <div className="mt-24 flex justify-center">
                <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-5/6">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <ThemedText type="defaultSemiBold" className="text-xl" colorText="white">
                            {t("admins")}
                        </ThemedText>
                        {
                            userRole === "admin" ?
                                <button
                                    style={{ border: "none", cursor: "pointer" }}
                                    className="bg-black hover:bg-opacity-80 transition duration-200"
                                    onClick={handleDialogOpen}
                                >
                                    <Add className="text-white text-2xl" />
                                </button> : undefined
                        }
                    </div>

                    <div className="overflow-x-auto -mx-2">
                    <table className="w-full border-collapse text-white min-w-[480px]">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="border-b border-gray-600 p-3 cursor-pointer font-bold text-base text-left
                                            "
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
                                        <td key={cell.id} className="p-3 border-b border-gray-600">
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
                    {editId ? t("edit") : t("add")}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label={t("email")}
                        fullWidth
                        margin="normal"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 mt-2 bg-[#f7f7e3] text-black border rounded-md border-[#a855f7] focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
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

                    <FormControl fullWidth margin="normal" className="w-full p-3 mt-2 bg-[#f7f7e3] text-black border rounded-md border-[#a855f7] focus:outline-none focus:ring-2 focus:ring-[#a855f7]">
                        <InputLabel>{t("role", "角色")}</InputLabel>
                        <Select
                            value={formData.role}
                            label={t("role", "角色")}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            error={!!errors.role}
                        >
                            <MenuItem value="subadmin">Subadmin</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>

                        </Select>
                        {errors.role && <FormHelperText error>{errors.role}</FormHelperText>}
                    </FormControl>


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

export default AdminsPage;
