import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Box
} from "@mui/material";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useFacultyData } from "../../../context/FacultyDataContext";

export default function VisitsAbroadPage() {
  const { data: session } = useSession();
  const { facultyData, updateFacultySection } = useFacultyData();
  const [visits, setVisits] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (facultyData?.visits_abroad) {
      setVisits(facultyData.visits_abroad);
    }
  }, [facultyData]);

  const handleSave = async (visit) => {
    const payload = {
      ...visit,
      email: session?.user?.email,
      id: visit.id || Date.now().toString(),
      type: "visits_abroad",
    };
    await fetch("/api/create/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const exists = visits.some((v) => v.id === payload.id);
    const updated = exists
      ? visits.map((v) => (v.id === payload.id ? payload : v))
      : [...visits, payload];
    setVisits(updated);
    updateFacultySection("visits_abroad", updated);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/create/faculty?type=visits_abroad&id=${id}`, { method: "DELETE" });
    const updated = visits.filter((v) => v.id !== id);
    setVisits(updated);
    updateFacultySection("visits_abroad", updated);
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

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Visits Abroad</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditItem(null);
            setOpenEdit(true);
          }}
        >
          Add Visit
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Funded By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.country}</TableCell>
                <TableCell>{formatDate(v.start_date)}</TableCell>
                <TableCell>{v.end_date ? formatDate(v.end_date) : "Continue"}</TableCell>
                <TableCell>{v.purpose}</TableCell>
                <TableCell>{v.funded_by}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setEditItem(v);
                      setOpenEdit(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(v.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openEdit && (
        <EditVisitDialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSave={handleSave}
          visit={editItem}
        />
      )}
    </div>
  );
}

function EditVisitDialog({ open, onClose, onSave, visit }) {
  const [country, setCountry] = useState(visit?.country || "");
  const [startDate, setStartDate] = useState(visit?.start_date || "");
  const [endDate, setEndDate] = useState(visit?.end_date || "");
  const [purpose, setPurpose] = useState(visit?.purpose || "");
  const [fundedBy, setFundedBy] = useState(visit?.funded_by || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      country,
      start_date: startDate,
      end_date: endDate,
      purpose,
      funded_by: fundedBy,
      id: visit?.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{visit ? "Edit Visit" : "Add Visit"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
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
          <TextField
            fullWidth
            margin="normal"
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Funded By"
            value={fundedBy}
            onChange={(e) => setFundedBy(e.target.value)}
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
