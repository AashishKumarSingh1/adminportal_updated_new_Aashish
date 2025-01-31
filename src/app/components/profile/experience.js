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
    FormControlLabel
} from '@mui/material';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

export function ExperiencePage() {
    const { data: session } = useSession();
    const [experienceData, setExperienceData] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editExperience, setEditExperience] = useState(null);

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const res = await fetch(`/api/experience?email=${session?.user?.email}`);
                if (!res.ok) throw new Error('Failed to fetch experience data');
                const data = await res.json();
                setExperienceData(data.workExperiences || []); // Adjusting to the correct key in the response
            } catch (error) {
                console.error('Error fetching experience data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.email) {
            fetchExperience();
        }
    }, [session]);

    const handleSave = async (newExperience) => {
        try {
            const res = await fetch('/api/experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session?.user?.email,
                    ...newExperience
                })
            });

            if (!res.ok) throw new Error('Failed to save experience data');
            setExperienceData([...experienceData, newExperience]);
        } catch (error) {
            console.error('Error saving experience data:', error);
        }
    };

    const handleDelete = async (experienceId) => {
        try {
            const res = await fetch(`/api/experience?id=${experienceId}`, {
                method: 'DELETE',
            });
    
            if (!res.ok) {
                throw new Error('Failed to delete experience');
            }
    
            setExperienceData(experienceData.filter((exp) => exp.id !== experienceId));
        } catch (error) {
            console.error('Error deleting experience:', error);
        }
    };
    

    const handleEdit = (experience) => {
        setEditExperience(experience);
        setOpenEdit(true);
    };

    const formatDate = (date) => {
        if (!date) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Work Experience</Typography>
                <Button
                    startIcon={<EditIcon />}
                    variant="contained"
                    onClick={() => setOpenEdit(true)}
                >
                    Add Experience
                </Button>
            </div>

            {loading ? (
                <div>Loading experience details...</div>
            ) : (
                <TableContainer component={Paper} style={{ margin: '1rem' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Work Experience</TableCell>
                                <TableCell>Institute Name</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {experienceData.length > 0 ? (
                                experienceData.map((exp, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{exp.work_experience || 'N/A'}</TableCell>
                                        <TableCell>{exp.institute || 'N/A'}</TableCell>
                                        <TableCell>{formatDate(exp.start_date)}</TableCell>
                                        <TableCell>{exp.end_date === 'continue' ? 'Continue' : formatDate(exp.end_date)}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(exp)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(exp.id)} color="secondary">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No experience details available.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {openEdit && (
                <EditExperienceDialog
                    open={openEdit}
                    onClose={() => setOpenEdit(false)}
                    onSave={(newExperience) => {
                        if (editExperience) {
                            const updatedExperienceData = experienceData.map((exp) =>
                                exp.id === editExperience.id ? { ...exp, ...newExperience } : exp
                            );
                            setExperienceData(updatedExperienceData);
                        } else {
                            handleSave(newExperience);
                        }
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
    const [workExperience, setWorkExperience] = useState(experience ? experience.work_experience : '');
    const [institute, setInstitute] = useState(experience ? experience.institute : '');
    const [startDate, setStartDate] = useState(experience ? experience.start_date : '');
    const [endDate, setEndDate] = useState(experience ? (experience.end_date === 'continue' ? '' : experience.end_date) : '');
    const [isContinuing, setIsContinuing] = useState(experience ? experience.end_date === 'continue' : false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const newExperience = {
            work_experience: workExperience,
            institute,
            start_date: startDate,
            end_date: isContinuing ? 'continue' : endDate,
        };

        onSave(newExperience);
        setSubmitting(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{experience ? 'Edit Work Experience' : 'Add Work Experience'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Work Experience"
                        value={workExperience}
                        onChange={(e) => setWorkExperience(e.target.value)}
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
                        value={isContinuing ? '' : endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isContinuing}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isContinuing}
                                onChange={(e) => {
                                    setIsContinuing(e.target.checked);
                                    if (e.target.checked) setEndDate('');
                                }}
                            />
                        }
                        label="Currently Working"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={submitting} variant="contained" startIcon={<SaveIcon />}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
