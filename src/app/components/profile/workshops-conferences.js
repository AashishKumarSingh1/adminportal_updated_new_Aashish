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
    Select,
    MenuItem,
    InputLabel
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        event_type: '',
        role: '',
        event_name: '',
        sponsored_by: '',
        start_date: null,
        end_date: null,
        participants_count: ''
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
            console.log('Sending data:', {
                type: 'workshops_conferences',
                ...content,
                start_date: content.start_date
                    ? new Date(content.start_date).toISOString().split('T')[0]
                    : null,
                end_date: content.end_date
                    ? new Date(content.end_date).toISOString().split('T')[0]
                    : null,
                id: Date.now().toString(),
                email: session?.user?.email,
            });
            
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'workshops_conferences',
                  ...content,
                  // Format start_date and end_date to 'YYYY-MM-DD' for DATE or 'YYYY-MM-DD HH:MM:SS' for DATETIME
                  start_date: content.start_date 
                    ? new Date(content.start_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                    : null,
                  end_date: content.end_date 
                    ? new Date(content.end_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                    : null,
                  id: Date.now().toString(),
                  email: session?.user?.email,
                }),
              });
              

            if (!result.ok) throw new Error('Failed to create')

            handleClose()
            refreshData()
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
                <DialogTitle>Add Workshop/Conference</DialogTitle>
                <DialogContent>
                    <InputLabel id="event-type">Event Type</InputLabel>
                    <Select
                        labelId="event-type"
                        name="event_type"
                        value={content.event_type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Workshop">Workshop</MenuItem>
                        <MenuItem value="Conference">Conference</MenuItem>
                        <MenuItem value="Seminar">Seminar</MenuItem>
                        <MenuItem value="Symposium">Symposium</MenuItem>
                    </Select>
                    <InputLabel id="role">Role</InputLabel>
                    <Select
                        labelId="role"
                        name="role"
                        value={content.role}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Organizer">Organizer</MenuItem>
                        <MenuItem value="Coordinator">Coordinator</MenuItem>
                        <MenuItem value="Speaker">Speaker</MenuItem>
                        <MenuItem value="Participant">Participant</MenuItem>
                    </Select>
                    <TextField
                        margin="dense"
                        label="Event Name"
                        name="event_name"
                        fullWidth
                        required
                        value={content.event_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Sponsored By"
                        name="sponsored_by"
                        fullWidth
                        value={content.sponsored_by}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) =>
                                setContent({ ...content, start_date: newValue })
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date}
                            onChange={(newValue) =>
                                setContent({ ...content, end_date: newValue })
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Number of Participants"
                        name="participants_count"
                        type="number"
                        fullWidth
                        required
                        value={content.participants_count}
                        onChange={handleChange}
                    />
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
                    type: 'workshops_conferences',
                    ...content,
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to update')

            handleClose()
            refreshData()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Workshop/Conference</DialogTitle>
                <DialogContent>
                    {/* Same form fields as AddForm */}
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
export default function WorkshopConferenceManagement() {
    const { data: session } = useSession()
    const [events, setEvents] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    // Fetch data
    React.useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setEvents(data.workshops_conferences || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchEvents()
        }
    }, [session, refreshData])

    const handleEdit = (event) => {
        setSelectedEvent(event)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'workshops_conferences',
                        id,
                        email: session?.user?.email
                    }),
                })

                if (!response.ok) throw new Error('Failed to delete')
                refreshData()
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenAdd(true)}
                sx={{ mb: 2 }}
            >
                Add Workshop/Conference
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Participants</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events?.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell>{event.event_name}</TableCell>
                                <TableCell>{event.event_type}</TableCell>
                                <TableCell>{event.role}</TableCell>
                                <TableCell>
                                    {new Date(event.start_date).toLocaleDateString()} -
                                    {new Date(event.end_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{event.participants_count}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        onClick={() => handleEdit(event)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(event.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {events?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No events found
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

            {selectedEvent && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedEvent(null)
                    }}
                    values={selectedEvent}
                />
            )}
        </div>
    )
} 