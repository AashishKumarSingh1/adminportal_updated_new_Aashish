'use client'

import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '@/context/FacultyDataContext'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format } from 'date-fns'
import Loading from '../common/Loading'
import Toast from '../common/Toast'

// Add Form Component
export function AddWork({ handleClose, modal }) {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = {
        designation: '',
        organization: '',
        from_date: null,
        to_date: null,
        description: ''
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'work_experience',
                    ...content,
                    id: Date.now().toString(),
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to create')
            
            const updatedData = await result.json();
            
            // Update the context data
            updateFacultySection(14, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getWorkExperienceComponent) {
                window.getWorkExperienceComponent().updateWorkExperience(updatedData.data);
            }
            
            handleClose()
            setContent(initialState)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Work Experience</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Designation"
                        name="designation"
                        fullWidth
                        required
                        value={content.designation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Organization"
                        name="organization"
                        fullWidth
                        required
                        value={content.organization}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="From Date"
                            value={content.from_date}
                            onChange={(date) => setContent({ ...content, from_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                        <DatePicker
                            label="To Date"
                            value={content.to_date}
                            onChange={(date) => setContent({ ...content, to_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={4}
                        value={content.description}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={submitting}
                    >
                        {submitting ? 'Adding...' : 'Add'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Edit Form Component
export function EditWork({ handleClose, modal, values }) {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const [content, setContent] = useState(values)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'work_experience',
                    ...content,
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            const updatedData = await result.json();
            
            // Update the context data
            updateFacultySection(14, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getWorkExperienceComponent) {
                window.getWorkExperienceComponent().updateWorkExperience(updatedData.data);
            }
            
            handleClose()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Work Experience</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Designation"
                        name="designation"
                        fullWidth
                        required
                        value={content.designation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Organization"
                        name="organization"
                        fullWidth
                        required
                        value={content.organization}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="From Date"
                            value={content.from_date}
                            onChange={(date) => setContent({ ...content, from_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                        <DatePicker
                            label="To Date"
                            value={content.to_date}
                            onChange={(date) => setContent({ ...content, to_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={4}
                        value={content.description}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Work Experience Row Component
export function WorkExpRow({ data, onEdit, onDelete }) {
    return (
        <TableRow>
            <TableCell>{data.designation}</TableCell>
            <TableCell>{data.organization}</TableCell>
            <TableCell>
                {data.from_date ? format(new Date(data.from_date), 'dd/MM/yyyy') : ''}
            </TableCell>
            <TableCell>
                {data.to_date ? format(new Date(data.to_date), 'dd/MM/yyyy') : ''}
            </TableCell>
            <TableCell>{data.description}</TableCell>
            <TableCell>
                <IconButton onClick={() => onEdit(data)}>
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(data.id)}>
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    )
}

export function WorkExperience() {
    const { data: session } = useSession();
    const { facultyData, updateFacultySection } = useFacultyData();
    const [workExperiences, setWorkExperiences] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({
        open: false,
        severity: 'success',
        message: ''
    });

    // Add window reference to this component
    React.useEffect(() => {
        // Expose the component instance to the window
        window.getWorkExperienceComponent = () => ({
            updateWorkExperience: (newData) => {
                setWorkExperiences(newData);
            }
        });
        
        // Cleanup
        return () => {
            delete window.getWorkExperienceComponent;
        };
    }, []);

    // Fetch data
    React.useEffect(() => {
        const fetchWorkExperience = async () => {
            try {
                if (facultyData) {
                    setWorkExperiences(facultyData.work_experience || []);
                    setLoading(false);
                } else if (session?.user?.email) {
                    const response = await fetch(`/api/faculty?type=${session.user.email}`);
                    if (!response.ok) throw new Error('Failed to fetch');
                    const data = await response.json();
                    setWorkExperiences(data.work_experience || []);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setToast({
                    open: true,
                    severity: 'error',
                    message: 'Failed to load work experiences'
                });
                setLoading(false);
            }
        };

        fetchWorkExperience();
    }, [session, facultyData]);

    const handleEdit = (experience) => {
        setSelectedExperience(experience);
        setOpenEdit(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this work experience?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'work_experience',
                        id,
                        email: session?.user?.email,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete');
                }

                const updatedData = await response.json();
                
                // Update the context data
                updateFacultySection(14, updatedData.data);
                
                // Update the local state
                setWorkExperiences(updatedData.data);
                
                setToast({
                    open: true,
                    severity: 'success',
                    message: 'Work experience deleted successfully'
                });
            } catch (error) {
                console.error('Error:', error);
                setToast({
                    open: true,
                    severity: 'error',
                    message: 'Failed to delete work experience'
                });
            }
        }
    };

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return
        setToast(prev => ({ ...prev, open: false }))
    }

    if (loading) return <Loading />

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button 
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAdd(true)}
                >
                    Add Work Experience
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Designation</TableCell>
                            <TableCell>Organization</TableCell>
                            <TableCell>From Date</TableCell>
                            <TableCell>To Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workExperiences.length > 0 ? (
                            workExperiences.map((exp) => (
                                <WorkExpRow 
                                    key={exp.id} 
                                    data={exp} 
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No work experiences found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddWork
                modal={openAdd}
                handleClose={() => setOpenAdd(false)}
            />

            {selectedExperience && (
                <EditWork
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false);
                        setSelectedExperience(null);
                    }}
                    values={selectedExperience}
                />
            )}

            <Toast 
                open={toast.open}
                handleClose={handleCloseToast}
                severity={toast.severity}
                message={toast.message}
            />
        </div>
    )
} 