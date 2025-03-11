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
    IconButton,
    Checkbox,
    FormControlLabel,
    
} from '@mui/material'
import { Delete, Link } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import React, { useRef, useState } from 'react'
import { dateformatter } from './../common-props/date-formatter'
import { ConfirmDelete } from './confirm-delete'
import { AddAttachments } from './../common-props/add-attachment'
import { handleNewAttachments } from './../common-props/add-attachment'
import { administrationList, depList } from './../../../lib/const'
export const EditForm = ({ data, handleClose, modal }) => {
    const deleteArray = useRef([])
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState({
        id: data.id,
        title: data.title,
        isVisible: 1,
        openDate: dateformatter(data.openDate),
        closeDate: dateformatter(data.closeDate),
        type: data.notice_type || 'general',
        department: data.department || null,
        important: data.important || false,
        department: data.department || null,
        isDept: data.isDept || 0

        
    })

    const [verifyDelete, setVerifyDelete] = useState(false)
    const handleDelete = () => {
        setVerifyDelete(true)
    }

    const [add_attach, setAdd_attach] = useState(() => {
        if (!data.attachments) return [];
        
        try {
            const attachData = typeof data.attachments === 'string' ? 
                JSON.parse(data.attachments) : 
                data.attachments;
                
            return Array.isArray(attachData) ? attachData : [];
        } catch (e) {
            console.error('Error parsing attachments data:', e);
            return [];
        }
    });

    const [new_attach, setNew_attach] = useState([]);

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
            let attachments = [...add_attach]
            if (new_attach.length) {
                const processedAttachments = await handleNewAttachments(new_attach)
                const newAttachmentsWithIds = processedAttachments.map(attachment => ({
                    id: Date.now() + Math.random(),
                    caption: attachment.caption,
                    url: attachment.url,
                    typeLink: attachment.typeLink
                }))
                attachments = [...attachments, ...newAttachmentsWithIds]
            }

            const finaldata = {
                id: content.id,
                title: content.title,
                
                openDate: new Date(content.openDate).getTime(),
                closeDate: new Date(content.closeDate).getTime(),
                notice_type: content.type,
                category: content.category,
                updatedAt: Date.now(),
                updatedBy: session.user.email,
                attachments: attachments,
                deleteArray: deleteArray.current,
                important: content.important,
                department: content.department || null,
                isDept: content.type === 'department' ? 1 : 0
            }

            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finaldata,
                    type: "notice"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to update notice')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error updating notice:', error)
            alert('Failed to update notice. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    Edit Notice
                    <IconButton
                        onClick={handleDelete}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            color: '#d32f2f'
                        }}
                    >
                        <Delete />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {/* Form fields same as add form */}
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
                        >
                            <MenuItem value="general">General</MenuItem>
                            <MenuItem value="department">Department</MenuItem>
                            {Array.from(administrationList).map(([key, value]) => (
                                <MenuItem key={key} value={key}>{value}</MenuItem>
                            ))}

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

                    <DisplayAdditionalAttach
                        add_attach={add_attach}
                        setAdd_attach={setAdd_attach}
                        deleteArray={deleteArray}
                    />

                    <AddAttachments
                        attachments={new_attach}
                        setAttachments={setNew_attach}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>

            <ConfirmDelete
                handleClose={() => setVerifyDelete(false)}
                modal={verifyDelete}
                id={data.id}
            />
        </Dialog>
    )
}

const DisplayAdditionalAttach = ({ add_attach, setAdd_attach, deleteArray }) => {
    const deleteAttachment = (idx) => {
        const values = [...add_attach]
        const attachmentToDelete = values[idx]
        
        if (attachmentToDelete.id) {
            deleteArray.current = [...deleteArray.current, {
                id: attachmentToDelete.id,
                url: attachmentToDelete.url
            }]
        }
        
        values.splice(idx, 1)
        setAdd_attach(values)
    }

    return (
        <>
            {add_attach?.map((attachment, idx) => (
                <div
                    key={idx}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '10px'
                    }}
                >
                    <TextField
                        type="text"
                        value={attachment.caption || ''}
                        fullWidth
                        label={`Attachment ${idx + 1}`}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        disabled
                    />
                    {attachment.url && (
                        <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#1976d2',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center' 
                            }}
                        >
                            <Link style={{ marginRight: '5px' }} />
                            View
                        </a>
                    )}
                    <Delete
                        onClick={() => deleteAttachment(idx)}
                        style={{
                            cursor: 'pointer',
                            color: '#d32f2f'
                        }}
                    />
                </div>
            ))}
        </>
    )
}
