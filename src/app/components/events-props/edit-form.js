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
    IconButton
} from '@mui/material'
import { Delete, Link } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import React, { useRef, useState } from 'react'
import { dateformatter } from './../common-props/date-formatter'
import { ConfirmDelete } from './confirm-delete'
import { AddAttachments } from './../common-props/add-attachment'
import { handleNewAttachments } from './../common-props/add-attachment'

export const EditForm = ({ data, handleClose, modal }) => {
    const deleteArray = useRef([])
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState({
        id: data.id,
        title: data.title,
        openDate: dateformatter(data.openDate),
        closeDate: dateformatter(data.closeDate),
        eventStartDate: dateformatter(data.eventStartDate),
        eventEndDate: dateformatter(data.eventEndDate),
        venue: data.venue,
        doclink: data.doclink || '',
        type: data.type || 'general',
    })

    const [verifyDelete, setVerifyDelete] = useState(false)
    const handleDelete = () => {
        setVerifyDelete(true)
    }

    const [add_attach, setAdd_attach] = useState(() => {
        if (!data.attachments) return [];
        if (typeof data.attachments === 'string') {
            try {
                return JSON.parse(data.attachments);
            } catch (e) {
                console.error('Error parsing attachments:', e);
                return [];
            }
        }
        return Array.isArray(data.attachments) ? data.attachments : [];
    });

    const [new_attach, setNew_attach] = useState([]);

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
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
                eventStartDate: new Date(content.eventStartDate).getTime(),
                eventEndDate: new Date(content.eventEndDate).getTime(),
                venue: content.venue,
                doclink: content.doclink,
                type: content.type,
                updatedAt: Date.now(),
                updatedBy: session.user.email,
                event_link: null,
                attachments: JSON.stringify(attachments),
                deleteArray: deleteArray.current
            }

            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finaldata,
                    type: "event"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to update event')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error updating event:', error)
            alert('Failed to update event. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    Edit Event
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
                    <TextField
                        margin="dense"
                        label="Event Start Date"
                        name="eventStartDate"
                        type="date"
                        required
                        fullWidth
                        value={content.eventStartDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Event End Date"
                        name="eventEndDate"
                        type="date"
                        required
                        fullWidth
                        value={content.eventEndDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Venue"
                        name="venue"
                        type="text"
                        required
                        fullWidth
                        value={content.venue}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Registration Link"
                        name="doclink"
                        type="text"
                        fullWidth
                        value={content.doclink}
                        onChange={handleChange}
                    />
                    
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            value={content.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="general">General</MenuItem>
                            <MenuItem value="intranet">Intranet</MenuItem>
                        </Select>
                    </FormControl>

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
        if (values[idx].id) {
            deleteArray.current = [...deleteArray.current, values[idx].id]
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
