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
import { enGB } from 'date-fns/locale'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { parseISO, format } from 'date-fns';
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { useFacultyData } from '../../../context/FacultyDataContext'
// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = {
        membership_id: '',
        membership_society: '',
        start: null,
        end: null
    }
    const [content, setContent] = useState(initialState)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        const newMembership = {
            type: 'memberships',
            ...content,
            id: Date.now().toString(),
            email: session?.user?.email
        };

        try {
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMembership),
            })

            if (!result.ok) throw new Error('Failed to create')
            
            // Update state through window component reference
            if (window.getMembershipsComponent) {
                const currentMemberships = window.getMembershipsComponent().getMemberships() || [];
                const updatedMemberships = [...currentMemberships, newMembership];
                
                // Update both local state and context
                window.getMembershipsComponent().setMemberships(updatedMemberships);
                updateFacultySection('memberships', updatedMemberships);
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
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Professional Membership</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Membership ID"
                        name="membership_id"
                        fullWidth
                        required
                        value={content.membership_id}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Professional Society"
                        name="membership_society"
                        fullWidth
                        required
                        value={content.membership_society}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB} >
                        <DatePicker
                            label="Start Date"
                            value={content.start}
                            onChange={(newValue) => setContent({ ...content, start: newValue })}
                             format="dd/MM/yyyy"
                            renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                            required={true}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end === "Continue" ? null : content.end}
                            onChange={(newValue) => setContent({ ...content, end: newValue })}
                            disabled={content.end === "Continue"}
                            format="dd/MM/yyyy"
                            renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={content.end === "Continue"}
                                    onChange={(e) =>
                                        setContent({
                                            ...content,
                                            end: e.target.checked ? "Continue" : null,
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
    const { updateFacultySection } = useFacultyData()
    const [content, setContent] = useState(values)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const updatedMembership = {
                type: 'memberships',
                ...content,
                start_date: content.start_date ? new Date(content.start_date).toISOString().split('T')[0] : null,
                end_date: content.end_date ? new Date(content.end_date).toISOString().split('T')[0] : null,
                email: session?.user?.email
            };
            
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMembership),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            // Update state through window component reference
            if (window.getMembershipsComponent) {
                const currentMemberships = window.getMembershipsComponent().getMemberships();
                const updatedMemberships = currentMemberships.map(membership => 
                    membership.id === content.id ? content : membership
                );
                
                // Update both local state and context
                window.getMembershipsComponent().setMemberships(updatedMemberships);
                updateFacultySection('memberships', updatedMemberships);
            }
            
            handleClose()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleEndDateChange = (newValue) => {
        setContent((prevContent) => ({
            ...prevContent,
            end: newValue ? newValue : "Continue",
        }));
    };

    const handleContinueChange = (e) => {
        setContent((prevContent) => ({
            ...prevContent,
            end: e.target.checked ? "Continue" : null,
        }));
    };

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Professional Membership</DialogTitle>
                <DialogContent>
                    {/* Same form fields as AddForm */}
                    <TextField
                        margin="dense"
                        label="Membership ID"
                        name="membership_id"
                        fullWidth
                        required
                        value={content.membership_id}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Professional Society"
                        name="membership_society"
                        fullWidth
                        required
                        value={content.membership_society}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB} >
                        <DatePicker
                            label="Start Date"
                            value={new Date(content.start)}
                            onChange={(newValue) => setContent({ ...content, start: newValue })}
                              format="dd/MM/yyyy"
                            renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                        />
                        <DatePicker
                            label="End Date"
                            value={
                                content.end === "Continue" || !content.end
                                    ? null
                                    : new Date(content.end)
                            }
                            onChange={(newValue) => handleEndDateChange(newValue)}
                            disabled={content.end === "Continue"}
                            format="dd/MM/yyyy"
                            renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={content.end === "Continue"}
                                    onChange={handleContinueChange}
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
export default function MembershipManagement() {
    const { data: session } = useSession()
    const { getMemberships, loading: contextLoading, updateFacultySection } = useFacultyData()
    const [memberships, setMemberships] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedMembership, setSelectedMembership] = useState(null)
    const [loading, setLoading] = useState(false)

    // Set up component reference for child components
    React.useEffect(() => {
        window.getMembershipsComponent = () => ({
            getMemberships: () => memberships,
            setMemberships: (newMemberships) => setMemberships(newMemberships)
        });
    }, [memberships]);

    // Get data from context
    React.useEffect(() => {
        const membershipsData = getMemberships() || [];
        setMemberships(membershipsData);
    }, [getMemberships])

    const handleEdit = (membership) => {
        setSelectedMembership(membership)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this membership?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'memberships',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state and context
                const updatedMemberships = memberships.filter(membership => membership.id !== id);
                setMemberships(updatedMemberships);
                updateFacultySection('memberships', updatedMemberships);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading || contextLoading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Professional Memberships</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Membership
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Membership ID</TableCell>
                            <TableCell>Professional Society</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {memberships
                            ?.slice()
                            .sort((a, b) => {
                                const aEnd = a.end === "Continue" ? new Date() : new Date(a.end);
                                const bEnd = b.end === "Continue" ? new Date() : new Date(b.end);

                                return bEnd - aEnd;
                            })
                            .map((membership) => (
                            <TableRow key={membership.id}>
                                <TableCell>{membership.membership_id}</TableCell>
                                <TableCell>{membership.membership_society}</TableCell>
                                <TableCell>
                                    {new Date(membership.start).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell>
                                    {membership.end !='Continue' ? 
                                        new Date(membership.end).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 
                                        'Continue'}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(membership)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(membership.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {memberships?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No memberships found
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

            {selectedMembership && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedMembership(null)
                    }}
                    values={selectedMembership}
                />
            )}
        </div>
    )
}