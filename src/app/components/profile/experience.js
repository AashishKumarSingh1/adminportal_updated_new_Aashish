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
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFacultyData } from "../../../context/FacultyDataContext";

export function ExperiencePage() {
  const { data: session } = useSession();
  const { facultyData, loading, updateFacultySection } = useFacultyData();
  const [experienceData, setExperienceData] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editExperience, setEditExperience] = useState(null);

  useEffect(() => {
    if (facultyData?.work_experience) {
      setExperienceData(facultyData.work_experience || []);
    }
  }, [facultyData]);

  const handleSave = async (newExperience) => {
    try {
      const adjustedExperience = {
        ...newExperience,
        start_date: newExperience.start_date,
        end_date: newExperience.end_date || "continue",
        email: session?.user?.email,
        id: newExperience.id || Date.now().toString(),
      };

      const res = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "work_experience",
          ...adjustedExperience,
        }),
      });

      if (!res.ok) throw new Error("Failed to save experience data");

      let updatedExperienceData;
      const exists = experienceData.some((exp) => exp.id === adjustedExperience.id);
      if (exists) {
        updatedExperienceData = experienceData.map((exp) =>
          exp.id === adjustedExperience.id ? adjustedExperience : exp
        );
      } else {
        updatedExperienceData = [...experienceData, adjustedExperience];
      }

      setExperienceData(updatedExperienceData);
      updateFacultySection("work_experience", updatedExperienceData);
    } catch (error) {
      console.error("Error saving experience data:", error);
    }
  };

  const handleDelete = async (experienceId) => {
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "work_experience",
          id: experienceId,
          email: session?.user?.email,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete experience");

      const updatedExperienceData = experienceData.filter(
        (exp) => exp.id !== experienceId
      );
      setExperienceData(updatedExperienceData);
      updateFacultySection("work_experience", updatedExperienceData);
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const handleEdit = (experience) => {
    setEditExperience(experience);
    setOpenEdit(true);
  };

  const formatDate = (date) => {
    if (!date || date === "continue" || date === "1970-01-01" || date === null)
      return "Continue";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <Typography variant="h6">Work Experience</Typography>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={() => {
            setEditExperience(null);
            setOpenEdit(true);
          }}
          style={{ backgroundColor: "#830001", color: "white" }}
        >
          Add Experience
        </Button>
      </div>

      {loading ? (
        <div>Loading experience details...</div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Designation</TableCell>
                <TableCell>Institute Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {experienceData.length > 0 ? (
                [...experienceData]
                  .sort((a, b) => {
                    const dateA =
                      a.end_date === "continue" || !a.end_date
                        ? new Date()
                        : new Date(a.end_date);
                    const dateB =
                      b.end_date === "continue" || !b.end_date
                        ? new Date()
                        : new Date(b.end_date);
                    return dateB - dateA;
                  })
                  .map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.work_experiences || "N/A"}</TableCell>
                      <TableCell>{exp.institute || "N/A"}</TableCell>
                      <TableCell>{formatDate(exp.start_date)}</TableCell>
                      <TableCell>{formatDate(exp.end_date)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(exp)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(exp.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No experience details available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {openEdit && (
        <EditExperienceDialog
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setEditExperience(null);
          }}
          onSave={(newExperience) => {
            handleSave(newExperience);
            setOpenEdit(false);
            setEditExperience(null);
          }}
          experience={editExperience}
        />
      )}
    </div>
  );
}

function EditExperienceDialog({ open, onClose, onSave, experience }) {
  const [workExperience, setWorkExperience] = useState(
    experience ? experience.work_experiences : ""
  );
  const [institute, setInstitute] = useState(
    experience ? experience.institute : ""
  );
  const [startDate, setStartDate] = useState(
    experience ? experience.start_date : ""
  );
  const [endDate, setEndDate] = useState(
    experience && experience.end_date !== "continue" ? experience.end_date : ""
  );
  const [isContinuing, setIsContinuing] = useState(
    experience ? experience.end_date === "continue" || experience.end_date === null || experience.end_date === "1970-01-01" : false
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const newExperience = {
      work_experiences: workExperience, 
      institute,
      start_date: startDate,
      end_date: isContinuing ? "continue" : endDate,
      id: experience ? experience.id : undefined,
    };

    onSave(newExperience);
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {experience ? "Edit Work Experience" : "Add Work Experience"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Designation</InputLabel>
            <Select
              value={workExperience}
              onChange={(e) => setWorkExperience(e.target.value)}
              label="Designation"
            >
              <MenuItem value="Professor">Professor</MenuItem>
              <MenuItem value="Associate Professor">Associate Professor</MenuItem>
              <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
              <MenuItem value="Assistant Professor (Grade 1)">
                Assistant Professor (Grade 1)
              </MenuItem>
              <MenuItem value="Assistant Professor (Grade 2)">
                Assistant Professor (Grade 2)
              </MenuItem>
              <MenuItem value="Sr. Lecturer">Sr. Lecturer</MenuItem>
              <MenuItem value="Lecturer">Lecturer</MenuItem>
              <MenuItem value="Adhoc Faculty">Adhoc Faculty</MenuItem>
              <MenuItem value="Temporary Faculty">Temporary Faculty</MenuItem>
              <MenuItem value="Guest Faculty">Guest Faculty</MenuItem>
              <MenuItem value="Visiting Faculty">Visiting Faculty</MenuItem>
              <MenuItem value="Professional Experience">
                Professional Experience
              </MenuItem>
              <MenuItem value="Industrial Experience">
                Industrial Experience
              </MenuItem>
            </Select>
          </FormControl>
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
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={isContinuing ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isContinuing}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isContinuing}
                onChange={(e) => {
                  setIsContinuing(e.target.checked);
                  if (e.target.checked) setEndDate("");
                }}
              />
            }
            label="Currently Working"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
