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
import useRefreshData from '@/custom-hooks/refresh'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        title: '',
        description: '',
        patent_date: null
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
            const formattedPatentDate = new Date(content.patent_date).toISOString().split('T')[0]
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'patents',
                    ...content,
                    id: Date.now().toString(),
                    email: session?.user?.email,
                    patent_date: formattedPatentDate,
                }),
            })

            if (!result.ok) throw new Error('Failed to create')
            
            handleClose()
            refreshData()
            setContent(initialState)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            window.location.reload()
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Patent</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Patent Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={4}
                        required
                        value={content.description}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Patent Date"
                            value={content.patent_date}
                            onChange={(newValue) => 
                                setContent({ ...content, patent_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
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
                    type: 'patents',
                    ...content,
                    email: session?.user?.email,
                    patent_date:new Date(content.patent_date).toISOString().split("T")[[0]]
                }),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            handleClose()
            refreshData()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            window.location.reload()
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Patent</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Patent Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={4}
                        required
                        value={content.description}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Patent Date"
                            value={new Date(content.patent_date)}
                            onChange={(newValue) => 
                                setContent({ ...content, patent_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
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
export default function PatentManagement() {
    const { data: session } = useSession()
    const [patents, setPatents] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedPatent, setSelectedPatent] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    // Fetch data
    React.useEffect(() => {
        const fetchPatents = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setPatents(data.patents || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchPatents()
        }
    }, [session, refreshData])

    const handleEdit = (patent) => {
        setSelectedPatent(patent)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this patent?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'patents',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                refreshData()
            window.location.reload()
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Patents</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Patent
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Patent Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patents?.map((patent) => (
                            <TableRow key={patent.id}>
                                <TableCell>{patent.title}</TableCell>
                                <TableCell>{patent.description}</TableCell>
                                <TableCell>
                                    {new Date(patent.patent_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(patent)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(patent.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {patents?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No patents found
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

            {selectedPatent && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedPatent(null)
                    }}
                    values={selectedPatent}
                />
            )}
        </div>
    )
}