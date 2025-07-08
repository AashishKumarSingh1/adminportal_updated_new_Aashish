import { 
  Button, 
  Dialog, 
  MenuItem,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Select,
  InputLabel,
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DatePickerField from '@/app/components/common/DatePickerField'
import Loading from '../common/Loading'
import Toast from '../common/Toast'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        code: '',
        name: '',
        start: '',
        end: ''
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

        const data = {
            ...content,
            id: Date.now().toString(),
            email: session?.user?.email
        }

        try {
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'teaching_engagement',
                    ...data
                }),
            })

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
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ fontSize: '2rem' }}>
                    Add Subject
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Subject Code"
                        name="code"
                        fullWidth
                        value={content.code}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Subject Name"
                        name="name"
                        required
                        fullWidth
                        value={content.name}
                        onChange={handleChange}
                    />
                    <InputLabel id="select">Session</InputLabel>
                    <Select
                        variant="outlined"
                        labelId="select"
                        name="start"
                        value={content.start}
                        onChange={handleChange}
                        fullWidth
                        sx={{m: 2 }}
                    >
                        <MenuItem value="Spring">Spring</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                        <MenuItem value="Autumn">Autumn</MenuItem>
                    </Select>

                    <DatePickerField
                        label="Year"
                        value={content.end}
                        onChange={(newValue) => setContent({ ...content, end: newValue })}
                        views={['year']}
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
export const EditSubject = ({ handleClose, modal, values }) => {
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'teaching_engagement',
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
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ fontSize: '2rem' }}>
                    Edit Subject
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Subject Code"
                        name="code"
                        fullWidth
                        value={content.code}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Subject Name"
                        name="name"
                        required
                        fullWidth
                        value={content.name}
                        onChange={handleChange}
                    />
                    <InputLabel id="select">Session</InputLabel>
                    <Select
                        variant="outlined"
                        labelId="select"
                        name="start"
                        value={content.start}
                        onChange={handleChange}
                        fullWidth
                        sx={{m: 2 }}
                    >
                        <MenuItem value="Spring">Spring</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                        <MenuItem value="Autumn">Autumn</MenuItem>
                    </Select>

                    <DatePickerField
                        label="Year"
                        value={content.end}
                        onChange={(newValue) => setContent({ ...content, end: newValue })}
                        views={['year']}
                    />
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

// Subject List Component
export const SubjectList = ({ subjects, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Session</TableCell>
                        <TableCell>Year</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {subjects?.map((subject) => (
                        <TableRow key={subject.id}>
                            <TableCell>{subject.code}</TableCell>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>{subject.start}</TableCell>
                            <TableCell>{subject.end}</TableCell>
                            <TableCell align="right">
                                <IconButton 
                                    onClick={() => onEdit(subject)}
                                    color="primary"
                                    size="small"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={() => onDelete(subject.id)}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {subjects?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No subjects found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

// Main Subject Management Component
export default function SubjectManagement() {
    const { data: session } = useSession()
    const [subjects, setSubjects] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)
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

    // Fetch subjects on component mount
    React.useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setSubjects(data.teaching_engagement || [])
            } catch (error) {
                console.error('Error fetching subjects:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchSubjects()
        }
    }, [session, refreshData])

    const handleEdit = (subject) => {
        setSelectedSubject(subject)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'subjects',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                showToast('Subject deleted successfully!')
                refreshData()
            } catch (error) {
                console.error('Error:', error)
                showToast('Failed to delete subject', 'error')
            }
        }
    }

    if (loading) return <Loading />

    return (
        <div>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenAdd(true)}
                sx={{m: 2 }}
                style={{ backgroundColor: '#830001', color: 'white' }}
            >
                Add Subject
            </Button>

            <SubjectList 
                subjects={subjects}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AddForm 
                modal={openAdd}
                handleClose={() => setOpenAdd(false)}
            />

            {selectedSubject && (
                <EditSubject
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedSubject(null)
                    }}
                    values={selectedSubject}
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