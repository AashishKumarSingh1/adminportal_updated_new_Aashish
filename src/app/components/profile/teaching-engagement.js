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

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        semester: '',
        level: '',
        course_number: '',
        course_title: '',
        course_type: '',
        student_count: '',
        lectures: '',
        tutorials: '',
        practicals: '',
        total_theory: '',
        lab_hours: '',
        years_offered: ''
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
                    type: 'teaching_engagement',
                    ...content,
                    id: Date.now().toString(),
                    email: session?.user?.email
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
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Teaching Engagement</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Semester"
                        name="semester"
                        fullWidth
                        required
                        value={content.semester}
                        onChange={handleChange}
                    />
                    <InputLabel id="level">Level</InputLabel>
                    <Select
                        labelId="level"
                        name="level"
                        value={content.level}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="UG">UG</MenuItem>
                        <MenuItem value="PG">PG</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                    </Select>
                    <TextField
                        margin="dense"
                        label="Course Number"
                        name="course_number"
                        fullWidth
                        required
                        value={content.course_number}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Course Title"
                        name="course_title"
                        fullWidth
                        required
                        value={content.course_title}
                        onChange={handleChange}
                    />
                    <InputLabel id="course-type">Course Type</InputLabel>
                    <Select
                        labelId="course-type"
                        name="course_type"
                        value={content.course_type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Core">Core</MenuItem>
                        <MenuItem value="Elective">Elective</MenuItem>
                        <MenuItem value="Lab">Lab</MenuItem>
                    </Select>
                    <TextField
                        margin="dense"
                        label="Student Count"
                        name="student_count"
                        type="number"
                        fullWidth
                        required
                        value={content.student_count}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Lectures"
                        name="lectures"
                        type="number"
                        fullWidth
                        required
                        value={content.lectures}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Tutorials"
                        name="tutorials"
                        type="number"
                        fullWidth
                        required
                        value={content.tutorials}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Practicals"
                        name="practicals"
                        type="number"
                        fullWidth
                        required
                        value={content.practicals}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Total Theory Hours"
                        name="total_theory"
                        type="number"
                        fullWidth
                        required
                        value={content.total_theory}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Lab Hours"
                        name="lab_hours"
                        type="number"
                        fullWidth
                        required
                        value={content.lab_hours}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Years Offered"
                        name="years_offered"
                        fullWidth
                        required
                        value={content.years_offered}
                        onChange={handleChange}
                        helperText="e.g., 2020-2023"
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
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Teaching Engagement</DialogTitle>
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
export default function TeachingEngagementManagement() {
    const { data: session } = useSession()
    const [courses, setCourses] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    // Fetch data
    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setCourses(data.teaching_engagement || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchCourses()
        }
    }, [session, refreshData])

    const handleEdit = (course) => {
        setSelectedCourse(course)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'teaching_engagement',
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
                Add Course
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Course</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Students</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Years</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses?.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell>
                                    {course.course_number} - {course.course_title}
                                </TableCell>
                                <TableCell>{course.level}</TableCell>
                                <TableCell>{course.course_type}</TableCell>
                                <TableCell>{course.student_count}</TableCell>
                                <TableCell>
                                    T: {course.total_theory} | L: {course.lab_hours}
                                </TableCell>
                                <TableCell>{course.years_offered}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(course)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(course.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {courses?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No courses found
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

            {selectedCourse && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedCourse(null)
                    }}
                    values={selectedCourse}
                />
            )}
        </div>
    )
} 