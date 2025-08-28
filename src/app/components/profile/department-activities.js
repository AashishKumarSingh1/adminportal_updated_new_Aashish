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
import React, { useState } from 'react'
import { enGB } from 'date-fns/locale';

import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Loading from '../common/Loading'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add'
import { useFacultyData } from '../../../context/FacultyDataContext'
import { format } from 'date-fns';

// Add formatDate helper function at the top
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Date parsing error:', error);
        return '';
    }
};

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        activity_description: '',
        start_date: null,
        end_date: null,
        institute_name: 'National Institute of Technology Patna'
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
        setSubmitting(true)
        e.preventDefault()

        try {
            const newActivity = {
                type: 'department_activities',
                ...content,
                start_date: content.start_date
                    ? formatDateToMySQL(content.start_date) 
                    : null,
                end_date: content.end_date
                    ? content.end_date === "Continue"
                        ? "Continue"
                        : formatDateToMySQL(content.end_date)  
                    : null,
                id: Date.now().toString(),
                email: session?.user?.email,
            };
            
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newActivity),
            });

            if (!result.ok) throw new Error('Failed to create')
            
            // Get current activities from parent component
            const { updateFacultyData, facultyData } = window.getActivitiesComponent();
            
            // Update local state in parent component
            const updatedActivities = [...(facultyData.department_activities || []), newActivity];
            updateFacultyData(updatedActivities);
            
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
                <DialogTitle>Add Department Activity</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Activity Description"
                        name="activity_description"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        value={content.activity_description}
                        onChange={handleChange}
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
                            onChange={(newValue) => 
                                setContent({ ...content, start_date: newValue})
                            }
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
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
                                <TextField {...params} fullWidth margin="dense" />
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
export const EditForm = ({ handleClose, modal, values }) => {
    const { data: session } = useSession()
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
                type: 'department_activities',
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
            const { updateFacultyData, facultyData } = window.getActivitiesComponent();
            
            // Update local state in parent component
            const updatedActivities = facultyData.department_activities.map(activity => 
                activity.id === content.id ? updatedActivity : activity
            );
            updateFacultyData(updatedActivities);
            
            handleClose();
            if (typeof showToast === 'function') {
                showToast('Department activity updated successfully!');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to update department activity', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Department Activity</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Activity Description"
                        name="activity_description"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        value={content.activity_description}
                        onChange={handleChange}
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
                                <TextField {...params} fullWidth margin="dense" />
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
                                <TextField {...params} fullWidth margin="dense" />
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

// Main Component
export default function DepartmentActivityManagement() {
    const { data: session } = useSession()
    const [activities, setActivities] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState(null)
    const { facultyData, loading, updateFacultySection } = useFacultyData()

    const isOngoing = (activity) => !activity.end_date || activity.end_date === "Continue";

    // Use context data instead of API call
    React.useEffect(() => {
        if (facultyData?.department_activities) {
            console.log('DepartmentActivities - Using context data:', facultyData.department_activities)
            setActivities(facultyData.department_activities || [])
        }
    }, [facultyData])
    
    // Expose functions for child components
    React.useEffect(() => {
        window.getActivitiesComponent = () => ({
            updateFacultyData: (updatedActivities) => {
                setActivities(updatedActivities);
                updateFacultySection('department_activities', updatedActivities);
            },
            facultyData: { department_activities: activities }
        });
        
        return () => {
            delete window.getActivitiesComponent;
        };
    }, [activities, updateFacultySection]);

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
                        type: 'department_activities',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state directly
                const updatedActivities = activities.filter(activity => activity.id !== id);
                setActivities(updatedActivities);
                
                // Update context
                updateFacultySection('department_activities', updatedActivities);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <Loading />

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
                <Typography variant="h6">Department Activities</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Department Activity
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Activity Description</TableCell>
                            <TableCell>Institute Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedActivities?.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell>{activity.activity_description}</TableCell>
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
                        {activities?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No department activities found
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
        </div>
    )
}