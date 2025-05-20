"use client";
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
} from "@mui/material";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSession } from "next-auth/react";

export default function TalksAndLecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const { data: session } = useSession();

  const fetchLectures = async () => {
    try {
      const res = await fetch(`/api/faculty?type=${session?.user?.email}`);
      const data = await res.json();
      setLectures(data?.talks_and_lectures || []);
    } catch (err) {
      console.error("Failed to fetch lectures", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [session]);

  const handleSave = async (lecture) => {
    const url = lecture.id
      ? `/api/talks-and-lectures?id=${lecture.id}`
      : "/api/talks-and-lectures";
    const method = lecture.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lecture),
    });

    if (res.ok) {
      fetchLectures();
      setOpenDialog(false);
      setCurrentLecture(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    const res = await fetch(`/api/talks-and-lectures?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLectures((prev) => prev.filter((lec) => lec.id !== id));
    }
  };

  const handleEdit = (lecture) => {
    setCurrentLecture(lecture);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      <Typography variant="h6" sx={{ m: 2 }}>
        Talks and Lectures
      </Typography>
      <Button
        variant="contained"
        onClick={() => setOpenDialog(true)}
        sx={{ m: 2 }}
      >
        Add Lecture
      </Button>

      {loading ? (
        <Typography sx={{ m: 2 }}>Loading...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ m: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Institute Name</TableCell>
                <TableCell>Event Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lectures.length ? (
                lectures.map((lecture) => (
                  <TableRow key={lecture.id}>
                    <TableCell>{lecture.institute_name}</TableCell>
                    <TableCell>{lecture.event_name}</TableCell>
                    <TableCell>{formatDate(lecture.date)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(lecture)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(lecture.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No lectures yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {openDialog && (
        <LectureDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setCurrentLecture(null);
          }}
          onSave={handleSave}
          lecture={currentLecture}
          email={session?.user?.email}
        />
      )}
    </div>
  );
}

function LectureDialog({ open, onClose, onSave, lecture, email }) {
  const [institute, setInstitute] = useState(lecture?.institute_name || "");
  const [event, setEvent] = useState(lecture?.event_name || "");
  const [date, setDate] = useState(lecture?.date || "");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLecture = {
      id: lecture?.id,
      institute_name: institute,
      event_name: event,
      date: date && date.includes("T") ? date.split("T")[0] : date,
      email: email,
    };
    onSave(newLecture);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{lecture ? "Edit Lecture" : "Add Lecture"}</DialogTitle>
        <DialogContent>
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
            label="Event Name"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={date ? formatDate(date) : ""}
            onChange={(e) => setDate(e.target.value)}
            required
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
