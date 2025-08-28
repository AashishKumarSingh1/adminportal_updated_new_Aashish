"use client";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Box
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useFacultyData } from "../../../context/FacultyDataContext";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LecturesPage() {
  const { data: session } = useSession();
  const { facultyData, updateFacultySection } = useFacultyData();
  const [lectures, setLectures] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (facultyData?.talks_and_lectures) {
      setLectures(facultyData.talks_and_lectures);
    }
  }, [facultyData]);

  const handleSave = async (lecture) => {
    const url = "/api/talks-and-lectures";
    const method = lecture.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lecture),
    });

    if (res.ok) {
      const data = await res.json();
      const saved = { ...lecture, id: lecture.id || data.id };

      const updated = lecture.id
        ? lectures.map((l) => (l.id === lecture.id ? saved : l))
        : [...lectures, saved];

      setLectures(updated);
      updateFacultySection("talks_and_lectures", updated);
      setOpenDialog(false);
      setEditItem(null);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/talks-and-lectures?id=${id}`, { method: "DELETE" });
    const updated = lectures.filter((l) => l.id !== id);
    setLectures(updated);
    updateFacultySection("talks_and_lectures", updated);
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Talks & Lectures/Special Lectures</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setEditItem(null); setOpenDialog(true); }}>
          Add Lecture
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Topic</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Institute</TableCell>
              <TableCell>Lecture Date</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Financed By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lectures.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.topic || "-"}</TableCell>
                <TableCell>{l.event_name || "-"}</TableCell>
                <TableCell>{l.institute_name}</TableCell>
                <TableCell>{formatDate(l.lecture_date)}</TableCell>
                <TableCell>{formatDate(l.start_date)}</TableCell>
                <TableCell>{formatDate(l.end_date)}</TableCell>
                <TableCell>{l.financed_by || "-"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditItem(l); setOpenDialog(true); }}>
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

      {openDialog && (
        <LectureDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSave={handleSave}
          lecture={editItem}
          email={session?.user?.email}
        />
      )}
    </div>
  );
}

function LectureDialog({ open, onClose, onSave, lecture, email }) {
  const [institute, setInstitute] = useState(lecture?.institute_name || "");
  const [event, setEvent] = useState(lecture?.event_name || "");
  const [topic, setTopic] = useState(lecture?.topic || "");
  const [lectureDate, setLectureDate] = useState(lecture?.lecture_date || "");
  const [startDate, setStartDate] = useState(lecture?.start_date || "");
  const [endDate, setEndDate] = useState(lecture?.end_date || "");
  const [financedBy, setFinancedBy] = useState(lecture?.financed_by || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: lecture?.id,
      institute_name: institute,
      event_name: event || null,
      topic: topic || null,
      lecture_date: lectureDate || null,
      start_date: startDate || null,
      end_date: endDate || null,
      financed_by: financedBy || null,
      email,
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{lecture ? "Edit Lecture" : "Add Lecture"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Institute Name" value={institute}
            onChange={(e) => setInstitute(e.target.value)} required />

          <TextField fullWidth margin="normal" label="Topic"
            value={topic} onChange={(e) => setTopic(e.target.value)} />

          <TextField fullWidth margin="normal" label="Event Name"
            value={event} onChange={(e) => setEvent(e.target.value)} />

          <TextField fullWidth margin="normal" type="date" label="Lecture Date" InputLabelProps={{ shrink: true }}
            value={lectureDate} onChange={(e) => setLectureDate(e.target.value)} />

          <TextField fullWidth margin="normal" type="date" label="Start Date" InputLabelProps={{ shrink: true }}
            value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          <TextField fullWidth margin="normal" type="date" label="End Date" InputLabelProps={{ shrink: true }}
            value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <TextField fullWidth margin="normal" label="Financed By"
            value={financedBy} onChange={(e) => setFinancedBy(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
