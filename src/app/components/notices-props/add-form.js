import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { AddAttachments } from './../common-props/add-attachment'
import { handleNewAttachments } from './../common-props/add-attachment'
import { administrationList, depList } from './../../../lib/const'

export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState({
        title: '',
        openDate: '',
        closeDate: '',
        
        type: 'academics',
        category: 'academics',
        important: false,
        department: null,
        isDept: 0
    })

    const [new_attach, setNew_attach] = useState([])

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? 
            e.target.checked ? 1 : 0 : 
            e.target.value;
            
        setContent({ ...content, [e.target.name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            let attachments = []
            if (new_attach.length) {
                const processedAttachments = await handleNewAttachments(new_attach)
                attachments = processedAttachments.map(attachment => ({
                    // id: Date.now() + Math.random(),
                    caption: attachment.caption,
                    url: attachment.url,
                    // typeLink: attachment.typeLink
                }))
            }

            const finaldata = {
                id: Date.now(),
                title: content.title,
                openDate: new Date(content.openDate).getTime(),
                closeDate: new Date(content.closeDate).getTime(),
                isVisible: 1,
                notice_type: content.type,
                category: content.category,
                timestamp: Date.now(),
                email: session.user.email,
                author: session.user.name,
                attachments:attachments,
                important: content.important,
                department: content.department || null,
                isDept: content.type === 'department' ? 1 : 0
            }

            const result = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finaldata,
                    type: "notice"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to create notice')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error creating notice:', error)
            alert('Failed to create notice. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const getNoticeTypeOptions = () => {
        if (session?.user?.role === 'ACADEMIC_ADMIN') {
            return [
                <MenuItem key="academics" value="academics">Academics</MenuItem>
            ];
        }

        // Create array of menu items including administration list items
        return [
            <MenuItem key="general" value="general">General</MenuItem>,
            <MenuItem key="department" value="department">Department</MenuItem>,
            ...Array.from(administrationList).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
            ))
        ];
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Create New Notice</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title"
                        name="title"
                        type="text"
                        required
                        fullWidth
                        value={content.title}
                        onChange={handleChange}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Open Date"
                        name="openDate"
                        type="date"
                        required
                        fullWidth
                        value={content.openDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Close Date"
                        name="closeDate"
                        type="date"
                        required
                        fullWidth
                        value={content.closeDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="important"
                                checked={Boolean(content.important)}
                                onChange={handleChange}
                                color="primary"
                            />
                        }
                        label="Important"
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            value={content.type}
                            onChange={handleChange}
                            defaultValue={session?.user?.role === 'ACADEMIC_ADMIN' ? 'academics' : 'general'}
                        >
                            {getNoticeTypeOptions()}
                        </Select>
                    </FormControl>
                    {content.type === 'department' && (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Department</InputLabel>
                            <Select
                            name="department"
                            value={content.department}
                            onChange={handleChange}
                        >
                            {Array.from(depList).map(([key, value]) => (
                                <MenuItem key={value} value={value}>{value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    )}

                    <AddAttachments
                        attachments={new_attach}
                        setAttachments={setNew_attach}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} style={{ color: '#830001' }}>Cancel</Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        style={{ backgroundColor: '#830001', color: 'white' }}
                        disabled={submitting}
                    >
                        {submitting ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
