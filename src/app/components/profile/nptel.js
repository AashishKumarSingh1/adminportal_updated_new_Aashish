import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, MenuItem, Box
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

  const handleSave = async (course) => {
    const payload = {
      ...course,
      email: session?.user?.email,
      id: course.id || Date.now().toString(),
      type: "mooc_courses",
    };
    await fetch("/api/create/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const exists = courses.some((c) => c.id === payload.id);
    const updated = exists
      ? courses.map((c) => (c.id === payload.id ? payload : c))
      : [...courses, payload];
    setCourses(updated);
    updateFacultySection("mooc_courses", updated);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/create/faculty?type=mooc_courses&id=${id}`, { method: "DELETE" });
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    updateFacultySection("mooc_courses", updated);
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
        <Typography variant="h6">MOOC/NPTEL Courses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditItem(null); setOpenEdit(true); }}
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
        />
      )}
    </div>
  );
}

function EditCourseDialog({ open, onClose, onSave, course }) {
  const [code, setCode] = useState(course?.course_code || "");
  const [name, setName] = useState(course?.course_name || "");
  const [startDate, setStartDate] = useState(course?.start_date || "");
  const [endDate, setEndDate] = useState(course?.end_date || "");
  const [status, setStatus] = useState(course?.status || "Completed");

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
          {/* Dropdown for Status */}
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
