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

  const handleSave = async (visit) => {
    const payload = {
      ...visit,
      email: session?.user?.email,
      type: "visits_abroad",
    };

    try {
      const res = await fetch("/api/create/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to save visit:", await res.text());
        return;
      }

      const data = await res.json();
      const savedVisit = { ...payload, id: visit?.id || data.result.insertId };

      const updated = visits.some((v) => v.id === savedVisit.id)
        ? visits.map((v) => (v.id === savedVisit.id ? savedVisit : v))
        : [...visits, savedVisit];

      setVisits(updated);
      updateFacultySection("visits_abroad", updated);
    } catch (error) {
      console.error("Error saving visit:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/create/faculty?type=visits_abroad&id=${id}`, { method: "DELETE" });
      const updated = visits.filter((v) => v.id !== id);
      setVisits(updated);
      updateFacultySection("visits_abroad", updated);
    } catch (error) {
      console.error("Error deleting visit:", error);
    }
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
              <TableCell>Institute</TableCell>
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
                <TableCell>{v.institute_name}</TableCell>
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
          formatDateForInput={formatDateForInput}
        />
      )}
    </div>
  );
}

function EditVisitDialog({ open, onClose, onSave, visit, formatDateForInput }) {
  const [country, setCountry] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fundedBy, setFundedBy] = useState("");

  useEffect(() => {
    setCountry(visit?.country || "");
    setInstituteName(visit?.institute_name || "");
    setStartDate(visit?.start_date ? formatDateForInput(visit.start_date) : "");
    setEndDate(visit?.end_date ? formatDateForInput(visit.end_date) : "");
    setPurpose(visit?.purpose || "");
    setFundedBy(visit?.funded_by || "");
  }, [visit, formatDateForInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      country,
      institute_name: instituteName,
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
            label="Institute Name"
            value={instituteName}
            onChange={(e) => setInstituteName(e.target.value)}
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
