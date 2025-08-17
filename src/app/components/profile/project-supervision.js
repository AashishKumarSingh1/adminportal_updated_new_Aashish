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
  InputLabel,
  Typography
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { enGB } from 'date-fns/locale';
import { useFacultyData } from '../../../context/FacultyDataContext';

import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = {
        category: '',
        project_title: '',
        student_details: '',
        internal_supervisors: '',
        external_supervisors: '',
        start_date:'',
        end_date:''
    }
    const [content, setContent] = useState(initialState)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const newProject = {
              type: 'project_supervision',
              ...content,
              // Format start_date and end_date to 'YYYY-MM-DD' for DATE or 'YYYY-MM-DD HH:MM:SS' for DATETIME
              start_date: content.start_date
                ? new Date(content.start_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                : null,
              end_date: content.end_date,
              id: Date.now().toString(),
              email: session?.user?.email,
            };
            
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject),
            });
              
            if (!result.ok) throw new Error('Failed to create')
            
            // Update state through window component reference
            if (window.getProjectSupervisionComponent) {
                const currentProjects = window.getProjectSupervisionComponent().getProjects() || [];
                const updatedProjects = [...currentProjects, newProject];
                
                // Update both local state and context
                window.getProjectSupervisionComponent().setProjects(updatedProjects);
                updateFacultySection('projectSupervision', updatedProjects);
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
                <DialogTitle>Add Project Supervision</DialogTitle>
                <DialogContent>
                    <InputLabel id="category">Project Category</InputLabel>
                    <Select
                        labelId="category"
                        name="category"
                        value={content.category}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="BTech">B.Tech</MenuItem>
                        <MenuItem value="MTech">M.Tech</MenuItem>
                        {/* <MenuItem value="PhD">PhD</MenuItem> */}
                        <MenuItem value="MSc">MSc</MenuItem>
                        <MenuItem value="Int.Msc">Int.Msc</MenuItem>
                        <MenuItem value="B.Arch">B.Arch</MenuItem>
                        <MenuItem value="M.Arch">M.Arch</MenuItem>
                        <MenuItem value="MCA">MCA</MenuItem>
                        <MenuItem value="MURP">MURP</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
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
                        label="Student Details"
                        name="student_details"
                        fullWidth
                        required
                        multiline
                        rows={3}
                        value={content.student_details}
                        onChange={handleChange}
                        helperText="Enter student names-rollNumbers, etc. in the format Name1-RollNumber1, Name2-Roll Number2, etc."
                    />
                    <TextField
                        margin="dense"
                        label="Internal Supervisors"
                        name="internal_supervisors"
                        fullWidth
                        value={content.internal_supervisors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas Name1, Name2, etc."
                    />
                    <TextField
                        margin="dense"
                        label="External Supervisors"
                        name="external_supervisors"
                        fullWidth
                        value={content.external_supervisors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas Name1, Name2, etc."
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
export const EditForm = ({ handleClose, modal, values }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const [content, setContent] = useState(values)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'project_supervision',
                    ...content,
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            const updatedData = await result.json();
                
            // Update the context data
            updateFacultySection(17, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getProjectSupervisionComponent) {
                window.getProjectSupervisionComponent().updateData(updatedData.data);
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
                <DialogTitle>Edit Project Supervision</DialogTitle>
                <DialogContent>
                    <InputLabel id="category">Project Category</InputLabel>
                    <Select
                        labelId="category"
                        name="category"
                        value={content.category}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="BTech">B.Tech</MenuItem>
                        <MenuItem value="MTech">M.Tech</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                        <MenuItem value="MSC">MSC</MenuItem>
                        <MenuItem value="MCA">MCA</MenuItem>
                        <MenuItem value="MURP">MURP</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
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
                        label="Student Details"
                        name="student_details"
                        fullWidth
                        required
                        multiline
                        rows={3}
                        value={content.student_details}
                        onChange={handleChange}
                        helperText="Enter student names-rollNumbers, etc. in the format Name1-RollNumber1, Name2-Roll Number2, etc."
                    />
                    <TextField
                        margin="dense"
                        label="Internal Supervisors"
                        name="internal_supervisors"
                        fullWidth
                        value={content.internal_supervisors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas Name1, Name2, etc."
                    />
                    <TextField
                        margin="dense"
                        label="External Supervisors"
                        name="external_supervisors"
                        fullWidth
                        value={content.external_supervisors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas Name1, Name2, etc."
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={new Date(content.start_date)}
                                onChange={(newValue) => 
                                    setContent({ ...content, start_date: newValue})
                                }
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth margin="dense" size="medium" />
                                )}
                                required={true}
                            />
                            <DatePicker
                                label="End Date"
                                value={content.end_date === "Continue" ? null : new Date(content.end_date)}
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

// Main Component
export default function ProjectSupervisionManagement() {
    const { data: session } = useSession()
    const { getProjectSupervision, loading: contextLoading, updateFacultySection } = useFacultyData()
    const [projects, setProjects] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)
    const [loading, setLoading] = useState(false)

    // Set up component reference for child components
    React.useEffect(() => {
        window.getProjectSupervisionComponent = () => ({
            getProjects: () => projects,
            setProjects: (newProjects) => setProjects(newProjects)
        });
    }, [projects]);

    // Get data from context
    React.useEffect(() => {
        const projectSupervisionData = getProjectSupervision() || [];
        setProjects(projectSupervisionData);
    }, [getProjectSupervision])

    const handleEdit = (project) => {
        setSelectedProject(project)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'project_supervision',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state and context
                const updatedProjects = projects.filter(project => project.id !== id);
                setProjects(updatedProjects);
                updateFacultySection('projectSupervision', updatedProjects);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Project Supervision</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Project Supervision
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Project Title</TableCell>
                            <TableCell>Students</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Internal supervisors</TableCell>
                            <TableCell>External supervisors</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects?.sort((a, b) => {

                            const aDate = a.end_date === "Continue" ? new Date() : new Date(a.end_date);
                            const bDate = b.end_date === "Continue" ? new Date() : new Date(b.end_date);

                            return bDate - aDate;
                        })?.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>{project.category}</TableCell>
                                <TableCell>{project.project_title}</TableCell>
                                <TableCell>{project.student_details}</TableCell>
                                <TableCell>{new Date(project.start_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })} - {project.end_date === "Continue" ?"Continue":new Date(project.end_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}</TableCell>
                                
                                <TableCell>{project.internal_supervisors}</TableCell>
                                <TableCell>{project.external_supervisors}</TableCell>
                               
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(project)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(project.id)}
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
                                <TableCell colSpan={5} align="center">
                                    No project supervisions found
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