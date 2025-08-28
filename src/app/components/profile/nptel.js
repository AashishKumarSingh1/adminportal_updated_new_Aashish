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
  MenuItem,
  Box,
} from "@mui/material";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useFacultyData } from "../../../context/FacultyDataContext";

export default function MoocCoursesPage() {
  const { data: session } = useSession();
  const { facultyData, updateFacultySection } = useFacultyData();
  const [courses, setCourses] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (facultyData?.mooc_courses) {
      setCourses(facultyData.mooc_courses);
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

  const handleSave = async (course) => {
    const payload = {
      ...course,
      email: session?.user?.email,
      type: "mooc_courses",
    };

    try {
      const res = await fetch("/api/create/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to save course:", await res.text());
        return;
      }

      const data = await res.json();
      const savedCourse = { ...payload, id: course?.id || data.result.insertId };

      const updated = courses.some((c) => c.id === savedCourse.id)
        ? courses.map((c) => (c.id === savedCourse.id ? savedCourse : c))
        : [...courses, savedCourse];

      setCourses(updated);
      updateFacultySection("mooc_courses", updated);
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/create/faculty?type=mooc_courses&id=${id}`, { method: "DELETE" });
      const updated = courses.filter((c) => c.id !== id);
      setCourses(updated);
      updateFacultySection("mooc_courses", updated);
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">MOOC/NPTEL Courses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditItem(null);
            setOpenEdit(true);
          }}
        >
          Add Course
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.course_code}</TableCell>
                <TableCell>{c.course_name}</TableCell>
                <TableCell>{formatDate(c.start_date)}</TableCell>
                <TableCell>{formatDate(c.end_date)}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditItem(c); setOpenEdit(true); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(c.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openEdit && (
        <EditCourseDialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSave={handleSave}
          course={editItem}
          formatDateForInput={formatDateForInput}
        />
      )}
    </div>
  );
}

function EditCourseDialog({ open, onClose, onSave, course, formatDateForInput }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Completed");

  useEffect(() => {
    setCode(course?.course_code || "");
    setName(course?.course_name || "");
    setStartDate(course?.start_date ? formatDateForInput(course.start_date) : "");
    setEndDate(course?.end_date ? formatDateForInput(course.end_date) : "");
    setStatus(course?.status || "Completed");
  }, [course, formatDateForInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      course_code: code,
      course_name: name,
      start_date: startDate,
      end_date: endDate,
      status,
      id: course?.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{course ? "Edit Course" : "Add Course"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Course Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Course Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            required
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Floated">Floated</MenuItem>
          </TextField>
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
