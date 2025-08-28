import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
} from "@mui/material";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFacultyData } from "../../../context/FacultyDataContext";

export default function HonoursAwardsPage() {
  const { data: session } = useSession();
  const { facultyData, updateFacultySection } = useFacultyData();
  const [honours, setHonours] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (facultyData?.honours_awards) {
      setHonours(facultyData.honours_awards);
    }
  }, [facultyData]);

  const handleSave = async (newHonour) => {
    const payload = {
      ...newHonour,
      email: session?.user?.email,
      type: "honours_awards",
    };

    try {
      const res = await fetch("/api/create/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to save honour:", await res.text());
        return;
      }

      const data = await res.json();
      const savedHonour = { ...payload, id: newHonour.id || data.result.insertId };

      // Update local state
      const updated = honours.some((h) => h.id === savedHonour.id)
        ? honours.map((h) => (h.id === savedHonour.id ? savedHonour : h))
        : [...honours, savedHonour];

      setHonours(updated);
      updateFacultySection("honours_awards", updated);
    } catch (error) {
      console.error("Error saving honour:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/create/faculty?type=honours_awards&id=${id}`, {
        method: "DELETE",
      });
      const updated = honours.filter((h) => h.id !== id);
      setHonours(updated);
      updateFacultySection("honours_awards", updated);
    } catch (error) {
      console.error("Error deleting honour:", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Honours & Awards</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditItem(null);
            setOpenEdit(true);
          }}
        >
          Add Honour
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Award</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {honours.map((h) => (
              <TableRow key={h.id}>
                <TableCell>{h.honour_award}</TableCell>
                <TableCell>{formatDate(h.start_date)}</TableCell>
                <TableCell>{h.end_date ? formatDate(h.end_date) : "Continue"}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setEditItem(h);
                      setOpenEdit(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(h.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openEdit && (
        <EditHonourDialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSave={handleSave}
          honour={editItem}
          formatDateForInput={formatDateForInput}
        />
      )}
    </div>
  );
}

function EditHonourDialog({ open, onClose, onSave, honour, formatDateForInput }) {
  const [award, setAward] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setAward(honour?.honour_award || "");
    setStartDate(honour?.start_date ? formatDateForInput(honour.start_date) : "");
    setEndDate(honour?.end_date ? formatDateForInput(honour.end_date) : "");
  }, [honour, formatDateForInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      honour_award: award,
      start_date: startDate,
      end_date: endDate,
      id: honour?.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{honour ? "Edit Honour" : "Add Honour"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Honour/Award"
            value={award}
            onChange={(e) => setAward(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
