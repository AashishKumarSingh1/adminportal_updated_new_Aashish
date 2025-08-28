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
  Checkbox,
  FormControlLabel,
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

  const handleSave = async (board) => {
    const payload = {
      ...board,
      email: session?.user?.email,
      type: "editorial_boards",
    };

    try {
      const res = await fetch("/api/create/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to save board:", await res.text());
        return;
      }

      const data = await res.json();
      const savedBoard = { ...payload, id: board?.id || data.result.insertId };

      const updated = boards.some((b) => b.id === savedBoard.id)
        ? boards.map((b) => (b.id === savedBoard.id ? savedBoard : b))
        : [...boards, savedBoard];

      setBoards(updated);
      updateFacultySection("editorial_boards", updated);
    } catch (error) {
      console.error("Error saving board:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/create/faculty?type=editorial_boards&id=${id}`, {
        method: "DELETE",
      });
      const updated = boards.filter((b) => b.id !== id);
      setBoards(updated);
      updateFacultySection("editorial_boards", updated);
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Editorial Boards</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditItem(null);
            setOpenEdit(true);
          }}
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
                <TableCell>
                  {b.end_date ? formatDate(b.end_date) : "Continue"}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setEditItem(b);
                      setOpenEdit(true);
                    }}
                  >
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
          formatDateForInput={formatDateForInput}
        />
      )}
    </div>
  );
}

function EditBoardDialog({ open, onClose, onSave, board, formatDateForInput }) {
  const [position, setPosition] = useState("");
  const [journal, setJournal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isContinue, setIsContinue] = useState(false);

  useEffect(() => {
    setPosition(board?.position || "");
    setJournal(board?.journal_name || "");
    setStartDate(board?.start_date ? formatDateForInput(board.start_date) : "");
    setEndDate(board?.end_date ? formatDateForInput(board.end_date) : "");
    setIsContinue(!board?.end_date); // if no end_date, assume "Continue"
  }, [board, formatDateForInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      position,
      journal_name: journal,
      start_date: startDate,
      end_date: isContinue ? null : endDate, // don't send end_date if continue
      id: board?.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{board ? "Edit Editorial Role" : "Add Editorial Role"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Journal Name"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
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

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <TextField
              fullWidth
              margin="normal"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isContinue}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isContinue}
                  onChange={(e) => setIsContinue(e.target.checked)}
                />
              }
              label="Continue"
              sx={{ ml: 2 }}
            />
          </Box>
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
