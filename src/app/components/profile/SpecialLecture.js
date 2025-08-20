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

export default function SpecialLecturesPage() {
  const { data: session } = useSession();
  const { facultyData, updateFacultySection } = useFacultyData();
  const [lectures, setLectures] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (facultyData?.special_lectures) {
      setLectures(facultyData.special_lectures);
    }
  }, [facultyData]);

  const handleSave = async (lecture) => {
    const payload = {
      ...lecture,
      email: session?.user?.email,
      id: lecture.id || Date.now().toString(),
      type: "special_lectures",
    };

    await fetch("/api/create/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const exists = lectures.some((l) => l.id === payload.id);
    const updated = exists
      ? lectures.map((l) => (l.id === payload.id ? payload : l))
      : [...lectures, payload];
    setLectures(updated);
    updateFacultySection("special_lectures", updated);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/create/faculty?type=special_lectures&id=${id}`, { method: "DELETE" });
    const updated = lectures.filter((l) => l.id !== id);
    setLectures(updated);
    updateFacultySection("special_lectures", updated);
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
        <Typography variant="h6">Special Lectures</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditItem(null);
            setOpenEdit(true);
          }}
        >
          Add Lecture
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Topic</TableCell>
              <TableCell>Institute</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Financed By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lectures.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.topic}</TableCell>
                <TableCell>{l.institute_name}</TableCell>
                <TableCell>{formatDate(l.start_date)}</TableCell>
                <TableCell>{l.end_date ? formatDate(l.end_date) : "Continue"}</TableCell>
                <TableCell>{l.financed_by}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setEditItem(l);
                      setOpenEdit(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(l.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openEdit && (
        <EditLectureDialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSave={handleSave}
          lecture={editItem}
        />
      )}
    </div>
  );
}

function EditLectureDialog({ open, onClose, onSave, lecture }) {
  const [topic, setTopic] = useState(lecture?.topic || "");
  const [institute, setInstitute] = useState(lecture?.institute_name || "");
  const [startDate, setStartDate] = useState(lecture?.start_date || "");
  const [endDate, setEndDate] = useState(lecture?.end_date || "");
  const [financedBy, setFinancedBy] = useState(lecture?.financed_by || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      topic,
      institute_name: institute,
      start_date: startDate,
      end_date: endDate,
      financed_by: financedBy,
      id: lecture?.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{lecture ? "Edit Lecture" : "Add Lecture"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Institute Name"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
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
            label="Financed By"
            value={financedBy}
            onChange={(e) => setFinancedBy(e.target.value)}
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
