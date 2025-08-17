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
  TableRow,
  Typography
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useFacultyData } from '../../../context/FacultyDataContext'
import React, { useState } from 'react'
import { enGB } from 'date-fns/locale';
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Toast from '../common/Toast'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add';
// Add the formatDate helper function at the top
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Date parsing error:', error);
        return '';
    }
};

const isOngoing = (activity) => !activity.end_date || activity.end_date === "Continue";

// Main Component
export default function InstituteActivityManagement() {
    const { data: session } = useSession()
    const { facultyData, loading, updateFacultySection } = useFacultyData()
    const [activities, setActivities] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [toast, setToast] = useState({
        open: false,
        severity: 'success',
        message: ''
    })

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return
        setToast(prev => ({ ...prev, open: false }))
    }

    const showToast = (message, severity = 'success') => {
        setToast({
            open: true,
            severity,
            message
        })
    }

    // Get data from context
    React.useEffect(() => {
        if (facultyData?.institute_activities) {
            console.log('Institute Activities - Using context data:', facultyData.institute_activities)
            setActivities(facultyData.institute_activities || [])
        }
    }, [facultyData])
    
    // Expose functions for child components
    React.useEffect(() => {
        window.getInstituteActivitiesComponent = () => ({
            updateFacultyData: (updatedActivities) => {
                setActivities(updatedActivities);
                updateFacultySection('institute_activities', updatedActivities);
            },
            facultyData: { institute_activities: activities }
        });
        
        return () => {
            delete window.getInstituteActivitiesComponent;
        };
    }, [activities, updateFacultySection])

    const handleEdit = (activity) => {
        setSelectedActivity(activity)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'institute_activities',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state directly
                const updatedActivities = activities.filter(activity => activity.id !== id);
                setActivities(updatedActivities);
                
                // Update context
                updateFacultySection('institute_activities', updatedActivities);
                
                showToast('Institute activity deleted successfully!')
            } catch (error) {
                console.error('Error:', error)
                showToast('Failed to delete institute activity', 'error')
            }
        }
    }

    if (loading) return <div>Loading...</div>

    // Add Form Component
    const AddForm = ({ handleClose, modal }) => {
        const initialState = {
            role_position: '',
            start_date: null,
            end_date: null,
            institute_name: 'National Institute of Technology, Patna'
        }
        const [content, setContent] = useState(initialState)
        const refreshData = useRefreshData(false)
        const [submitting, setSubmitting] = useState(false)

        const handleChange = (e) => {
            setContent({ ...content, [e.target.name]: e.target.value })
        }

        const formatDateToMySQL = (date) => {
            if (!date) return null;
        
            const dateObj = typeof date === 'string' ? new Date(date) : date;

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day} 00:00:00`;
        };
        
        const handleSubmit = async (e) => {
            setSubmitting(true);
            e.preventDefault();
        
            try {
                const newActivity = {
                    type: 'institute_activities',
                    ...content,
                    start_date: content.start_date
                        ? formatDateToMySQL(content.start_date)  // Use the formatted start date
                        : null,
                    end_date: content.end_date
                        ? content.end_date === "Continue"
                            ? "Continue"
                            : formatDateToMySQL(content.end_date)  // Use the formatted end date
                        : null,
                    id: Date.now().toString(),
                    email: session?.user?.email,
                };
                
                const result = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newActivity),
                });
        
                if (!result.ok) throw new Error('Failed to create');
                
                // Get current activities from parent component
                const { updateFacultyData, facultyData } = window.getInstituteActivitiesComponent();
                
                // Update local state in parent component
                const updatedActivities = [...(facultyData.institute_activities || []), newActivity];
                updateFacultyData(updatedActivities);
        
                handleClose();
                setContent(initialState);
                showToast('Institute activity added successfully!');
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to add institute activity', 'error');
            } finally {
                setSubmitting(false);
            }
        };
        

        return (
            <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add Institute Activity</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Role/Position"
                            name="role_position"
                            fullWidth
                            required
                            value={content.role_position}
                            onChange={handleChange}
                            size="medium"
                        />
                        <TextField
                            margin="dense"
                            label="Institute Name"
                            name="institute_name"
                            fullWidth
                            required
                            value={content.institute_name}
                            onChange={handleChange}
                            size="medium"
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns } adapterLocale={enGB}>
                            <DatePicker
                                label="Start Date"
                                value={content.start_date}
                                onChange={(newValue) => 
                                    setContent({ ...content, start_date: newValue})
                                }
                                format="dd/MM/yyyy"
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth margin="dense" size="medium" />
                                )}
                                required={true}
                            />
                            <DatePicker
                                label="End Date"
                                value={content.end_date === "Continue" ? null : content.end_date}
                                onChange={(newValue) =>
                                    setContent({ ...content, end_date: newValue })
                                }
                                format="dd/MM/yyyy"
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth margin="dense" size="medium" />
                                )}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={content.end_date === "Continue"}
                                    onChange={(e) => 
                                        setContent({
                                            ...content,
                                            end_date: e.target.checked ? "Continue" : null,
                                        })
                                    }
                                />
                            }
                            label="Continue"
                        />
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }

    // Edit Form Component
    const EditForm = ({ handleClose, modal, values }) => {
        // Parse dates when initializing content
        const [content, setContent] = useState({
            ...values,
            start_date: values.start_date ? new Date(values.start_date) : null,
            end_date: values.end_date ? new Date(values.end_date) : null
        })
        const refreshData = useRefreshData(false)
        const [submitting, setSubmitting] = useState(false)

        const handleChange = (e) => {
            setContent({ ...content, [e.target.name]: e.target.value })
        }

        const formatDateToMySQL = (date) => {
            if (!date) return null;
        
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day} 00:00:00`;
        };
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            setSubmitting(true);
        
            try {
                const updatedActivity = {
                    type: 'institute_activities',
                    ...content,
                    start_date: content.start_date
                        ? formatDateToMySQL(content.start_date) 
                        : null,
                    end_date: content.end_date
                        ? content.end_date === "Continue"
                            ? "Continue"
                            : formatDateToMySQL(content.end_date) 
                        : null,
                    email: session?.user?.email
                };
                
                const result = await fetch('/api/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedActivity),
                });
        
                if (!result.ok) throw new Error('Failed to update');
                
                // Get current activities from parent component
                const { updateFacultyData, facultyData } = window.getInstituteActivitiesComponent();
                
                // Update local state in parent component
                const updatedActivities = facultyData.institute_activities.map(activity => 
                    activity.id === content.id ? updatedActivity : activity
                );
                updateFacultyData(updatedActivities);
        
                handleClose();
                showToast('Institute activity updated successfully!');
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to update institute activity', 'error');
            } finally {
                setSubmitting(false);
            }
        };
        

        return (
            <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Edit Institute Activity</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Role/Position"
                            name="role_position"
                            fullWidth
                            required
                            value={content.role_position}
                            onChange={handleChange}
                            size="medium"
                        />
                        <TextField
                            margin="dense"
                            label="Institute Name"
                            name="institute_name"
                            fullWidth
                            required
                            value={content.institute_name}
                            onChange={handleChange}
                            size="medium"
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                            <DatePicker
                                label="Start Date"
                                value={content.start_date}
                                onChange={(newValue) => {
                                    setContent(prev => ({
                                        ...prev,
                                        start_date: newValue
                                    }))
                                }}
                                 format="dd/MM/yyyy"
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth margin="dense" size="medium" />
                                )}
                                required={true}
                            />
                            <DatePicker
                                label="End Date"
                                value={content.end_date === "Continue" ? null : content.end_date}
                                onChange={(newValue) =>
                                    setContent({ ...content, end_date: newValue })
                                }
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth margin="dense" size="medium" />
                                )}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={content.end_date === "Continue"}
                                        onChange={(e) => 
                                            setContent({
                                                ...content,
                                                end_date: e.target.checked ? "Continue" : null,
                                            })
                                        }
                                    />
                                }
                                label="Continue"
                            />
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }

    const sortedActivities = [...activities].sort((a, b) => {
        const aOngoing = isOngoing(a);
        const bOngoing = isOngoing(b);

        if (aOngoing && !bOngoing) return -1;
        if (!aOngoing && bOngoing) return 1;

        if (aOngoing && bOngoing) {
            return new Date(b.start_date) - new Date(a.start_date);
        }

        return new Date(b.end_date) - new Date(a.end_date);
    });

    return (
        <div>
           
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Institute Activities</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Institute Activity
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Role/Position</TableCell>
                            <TableCell>Institute Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedActivities?.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell>{activity.role_position}</TableCell>
                                <TableCell>{activity.institute_name?activity.institute_name:"-"}</TableCell>
                                <TableCell>
                                    {new Date(activity.start_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                </TableCell>
                                <TableCell>
                                    {activity.end_date ? (activity.end_date === "Continue" ? "Continue" : new Date(activity.end_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })) : "Present"}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(activity)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(activity.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sortedActivities?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No institute activities found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddForm 
                modal={openAdd}
                handleClose={() => setOpenAdd(false)}
            />

            {selectedActivity && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedActivity(null)
                    }}
                    values={selectedActivity}
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