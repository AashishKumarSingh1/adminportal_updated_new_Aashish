"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  Button,
  CircularProgress,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { AddStaff } from "./staff-management/addStaff";
import { EditStaff } from "./staff-management/editStaff";
import { ConfirmDelete } from "./staff-management/confirm-delete";
import Loading from "./common/Loading";
import {getDeptFullName} from "@/lib/const";

const columns = [
  { id: "employee_code", label: "Employee Code", minWidth: 130 },
  { id: "name", label: "Name", minWidth: 180 },
  { id: "email", label: "Email", minWidth: 220 },
  { id: "department", label: "Department", minWidth: 180 },
  { id: "designation", label: "Designation", minWidth: 180 },
  { id: "cadre", label: "Cadre", minWidth: 160 },
  // { id: "status", label: "Status", minWidth: 100 },
  { id: "actions", label: "Actions", minWidth: 120 },
];

export function StaffTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch a single page of staff, matching staff2's server-side pagination
  const fetchStaff = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page + 1), // MUI TablePagination is 0-indexed, API is 1-indexed
        limit: String(rowsPerPage),
        name: nameSearch,
        department: departmentSearch,
      });

      const res = await fetch(`/api/staff2?${params.toString()}`);

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      setRows(Array.isArray(data?.data) ? data.data : []);
      setTotal(Number(data?.total) || 0);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff data when pagination or search changes
  useEffect(() => {
    fetchStaff();
  }, [page, rowsPerPage, nameSearch, departmentSearch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = async (staff) => {
    try {
      const res = await fetch(`/api/staff2?user_id=${staff.user_id}`);
      if (!res.ok) throw new Error("Failed to fetch staff details");
      const fullStaffData = await res.json();

      setSelectedStaff(fullStaffData);
      setOpenEdit(true);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      alert("Failed to load staff details");
    }
  };

  const handleDelete = async (staffRow) => {
    try {
      const res = await fetch(`/api/staff2?user_id=${staffRow.user_id}`);
      if (!res.ok) throw new Error("Failed to fetch staff details");
      const fullStaffData = await res.json();

      setStaffToDelete(fullStaffData);
      setOpenDelete(true);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      // Fallback: use the row data we already have
      setStaffToDelete(staffRow);
      setOpenDelete(true);
    }
  };

  const handleDeleteFromEdit = (staff) => {
    setStaffToDelete(staff);
    setOpenEdit(false);
    setOpenDelete(true);
  };

  useEffect(() => {
    setPage(0);
  }, [nameSearch, departmentSearch]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    try {
      const d = new Date(dateValue);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch (e) {
      // fallthrough to fallback
    }
    if (typeof dateValue === "string" && dateValue.includes("T"))
      return dateValue.split("T")[0];
    return String(dateValue);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Staff Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {loading && <Loading />}
          <TextField
            label="Search by Name"
            variant="outlined"
            size="small"
            value={nameInput}
            onChange={(e) => {
              const value = e.target.value;

              setNameInput(value);
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }

              const timeout = setTimeout(() => {
                setNameSearch(value);
              }, 1000);
              setSearchTimeout(timeout);
            }}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          />
          {/* <TextField
            label="Search by Department"
            variant="outlined"
            size="small"
            value={departmentInput}
            onChange={(e) => {
              const value = e.target.value;

              setDepartmentInput(value);
              setDepartmentSearch
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }

              const timeout = setTimeout(() => {
                setDepartmentSearch(value);
              }, 1000);

              setSearchTimeout(timeout);
            }}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          /> */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            style={{ backgroundColor: "#830001", color: "white" }}
          >
            Add Staff
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ minWidth: column.minWidth, fontWeight: "bold" }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                hover
                tabIndex={-1}
                key={row.user_id ?? row.id ?? row.email}
              >
                <TableCell>{row.employee_code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{getDeptFullName(row.department)}</TableCell>
                <TableCell>{row.designation}</TableCell>
                <TableCell>{row.cadre}</TableCell>
                {/* <TableCell>
                  {row.is_retired ? (
                    <span>
                      <span className="text-red-600 font-semibold">
                        Retired
                      </span>
                      <br />
                      <span>{formatDate(row.retirement_date)}</span>
                    </span>
                  ) : (
                    <span className="text-green-500 rounded-full font-semibold">
                      Active
                    </span>
                  )}
                </TableCell> */}
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(row)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(row)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <AddStaff
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          fetchStaff();
          setOpenAdd(false);
        }}
      />

      {selectedStaff && openEdit && (
        <EditStaff
          open={openEdit}
          faculty={selectedStaff}
          onClose={() => {
            setOpenEdit(false);
            setSelectedStaff(null);
          }}
          onSuccess={() => {
            fetchStaff();
            setOpenEdit(false);
            setSelectedStaff(null);
          }}
          onDelete={handleDeleteFromEdit}
        />
      )}

      {openDelete && staffToDelete && (
        <ConfirmDelete
          open={openDelete}
          onClose={() => {
            setOpenDelete(false);
            setStaffToDelete(null);
          }}
          faculty={staffToDelete}
          refreshTable={fetchStaff}
        />
      )}
    </Paper>
  );
}