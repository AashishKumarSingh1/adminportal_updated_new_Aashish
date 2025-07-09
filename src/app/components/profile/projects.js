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
  MenuItem,
  Select,
  InputLabel
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useFacultyData } from '../../../context/FacultyDataContext'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        project_title: '',
        funding_agency: '',
        financial_outlay: '',
        start_date: null,
        period_months: '',
        investigators: '',
        status: 'Ongoing'
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
            const newProject = {
                type: 'sponsored_projects',
                ...content,
                id: Date.now().toString(),
                email: session?.user?.email
            };
            
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProject),
            })

            if (!result.ok) throw new Error('Failed to create')
            
            // Get current projects from parent component
            const { updateFacultyData, facultyData } = window.getProjectsComponent();
            
            // Update local state in parent component
            const updatedProjects = [...(facultyData.sponsored_projects || []), newProject];
            updateFacultyData(updatedProjects);
            
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
                <DialogTitle sx={{ fontSize: '2rem' }}>
                    Add Project
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Project Title"
                        name="project_title"
                        fullWidth
                        required
                        value={content.project_title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Funding Agency"
                        name="funding_agency"
                        fullWidth
                        required
                        value={content.funding_agency}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Financial Outlay"
                        name="financial_outlay"
                        type="number"
                        fullWidth
                        required
                        value={content.financial_outlay}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) => 
                                setContent({ ...content, start_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                            required={true}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Duration (months)"
                        name="period_months"
                        type="number"
                        fullWidth
                        required
                        value={content.period_months}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Co-Investigators"
                        name="investigators"
                        fullWidth
                        multiline
                        rows={2}
                        value={content.investigators}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
                    />
                    <InputLabel id="status">Project Status</InputLabel>
                    <Select
                        labelId="status"
                        name="status"
                        value={content.status}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Ongoing">Ongoing</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Terminated">Terminated</MenuItem>
                    </Select>
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

// List Component
export const ProjectList = ({ projects, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Project Title</TableCell>
                        <TableCell>Funding Agency</TableCell>
                        <TableCell>Financial Outlay</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {projects?.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell>{project.project_title}</TableCell>
                            <TableCell>{project.funding_agency}</TableCell>
                            <TableCell>₹{project.financial_outlay}</TableCell>
                            <TableCell>
                                {new Date(project.start_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{project.period_months} months</TableCell>
                            <TableCell>{project.status}</TableCell>
                            <TableCell align="right">
                                <IconButton 
                                    onClick={() => onEdit(project)}
                                    color="primary"
                                    size="small"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={() => onDelete(project.id)}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {projects?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                No projects found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
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
        e.preventDefault()
        setSubmitting(true)

        try {
            const updatedProject = {
                type: 'sponsored_projects',
                ...content,
                email: session?.user?.email
            };
            
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProject),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            // Get current projects from parent component
            const { updateFacultyData, facultyData } = window.getProjectsComponent();
            
            // Update local state in parent component
            const updatedProjects = facultyData.sponsored_projects.map(project => 
                project.id === content.id ? updatedProject : project
            );
            updateFacultyData(updatedProjects);
            
            handleClose()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog 
            open={modal} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            disableBackdropClick
            disableEscapeKeyDown
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Project Title"
                        name="project_title"
                        fullWidth
                        required
                        value={content.project_title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Funding Agency"
                        name="funding_agency"
                        fullWidth
                        required
                        value={content.funding_agency}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Financial Outlay"
                        name="financial_outlay"
                        type="number"
                        fullWidth
                        required
                        value={content.financial_outlay}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) => {
                                setContent(prev => ({
                                    ...prev,
                                    start_date: newValue
                                }))
                            }}
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                            required={true}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Duration (months)"
                        name="period_months"
                        type="number"
                        fullWidth
                        required
                        value={content.period_months}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Co-Investigators"
                        name="investigators"
                        fullWidth
                        multiline
                        rows={2}
                        value={content.investigators}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
                    />
                    <InputLabel id="status">Project Status</InputLabel>
                    <Select
                        labelId="status"
                        name="status"
                        value={content.status}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Ongoing">Ongoing</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Terminated">Terminated</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
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
export default function ProjectManagement() {
    const { data: session } = useSession()
    const [projects, setProjects] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)
    const { facultyData, loading, updateFacultySection } = useFacultyData()
    
    // Use context data instead of API call
    React.useEffect(() => {
        if (facultyData?.sponsored_projects) {
            console.log('Projects - Using context data:', facultyData.sponsored_projects)
            setProjects(facultyData.sponsored_projects || [])
        }
    }, [facultyData])
    
    // Expose functions for child components
    React.useEffect(() => {
        window.getProjectsComponent = () => ({
            updateFacultyData: (updatedProjects) => {
                setProjects(updatedProjects);
                updateFacultySection('sponsored_projects', updatedProjects);
            },
            facultyData: { sponsored_projects: projects }
        });
        
        return () => {
            delete window.getProjectsComponent;
        };
    }, [projects, updateFacultySection])

    const handleEdit = (project) => {
        setSelectedProject(project)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'sponsored_projects',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state directly
                const updatedProjects = projects.filter(project => project.id !== id);
                setProjects(updatedProjects);
                
                // Update context
                updateFacultySection('sponsored_projects', updatedProjects);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenAdd(true)}
                sx={{m: 2 }}
                style={{ backgroundColor: '#830001', color: 'white' }}
            >
                Add Project
            </Button>

            <ProjectList 
                projects={projects}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AddForm 
                modal={openAdd}
                handleClose={() => setOpenAdd(false)}
            />

            {selectedProject && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedProject(null)
                    }}
                    values={selectedProject}
                />
            )}
        </div>
    )
} 