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

export default function EditorialBoardsPage() {
  const { data: session } = useSession();
  const { facultyData, updateFacultySection } = useFacultyData();
  const [boards, setBoards] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (facultyData?.editorial_boards) {
      setBoards(facultyData.editorial_boards);
    }
  }, [facultyData]);

  const handleSave = async (board) => {
    const payload = {
      ...board,
      email: session?.user?.email,
      id: board.id || Date.now().toString(),
      type: "editorial_boards",
    };
    await fetch("/api/create/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const exists = boards.some((b) => b.id === payload.id);
    const updated = exists ? boards.map((b) => (b.id === payload.id ? payload : b)) : [...boards, payload];
    setBoards(updated);
    updateFacultySection("editorial_boards", updated);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/create/faculty?type=editorial_boards&id=${id}`, { method: "DELETE" });
    const updated = boards.filter((b) => b.id !== id);
    setBoards(updated);
    updateFacultySection("editorial_boards", updated);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Editorial Boards</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditItem(null); setOpenEdit(true); }}
        >
          Add Editorial Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell>Journal</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.position}</TableCell>
                <TableCell>{b.journal_name}</TableCell>
                <TableCell>{formatDate(b.start_date)}</TableCell>
                <TableCell>{b.end_date ? formatDate(b.end_date) : "Continue"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditItem(b); setOpenEdit(true); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(b.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openEdit && (
        <EditBoardDialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSave={handleSave}
          board={editItem}
        />
      )}
    </div>
  );
}

function EditBoardDialog({ open, onClose, onSave, board }) {
  const [position, setPosition] = useState(board?.position || "");
  const [journal, setJournal] = useState(board?.journal_name || "");
  const [startDate, setStartDate] = useState(board?.start_date || "");
  const [endDate, setEndDate] = useState(board?.end_date || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ position, journal_name: journal, start_date: startDate, end_date: endDate, id: board?.id });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{board ? "Edit Editorial Role" : "Add Editorial Role"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="normal" label="Position"
            value={position} onChange={(e) => setPosition(e.target.value)} required
          />
          <TextField
            fullWidth margin="normal" label="Journal Name"
            value={journal} onChange={(e) => setJournal(e.target.value)} required
          />
          <TextField
            fullWidth margin="normal" type="date" label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate} onChange={(e) => setStartDate(e.target.value)} required
          />
          <TextField
            fullWidth margin="normal" type="date" label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate} onChange={(e) => setEndDate(e.target.value)}
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
