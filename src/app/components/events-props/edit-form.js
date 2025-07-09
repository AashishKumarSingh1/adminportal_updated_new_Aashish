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
    Grid,
    Typography,
    Divider,
    Box
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
        <Dialog 
            open={modal} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    '& .MuiDialogContent-root': {
                        '&::-webkit-scrollbar': {
                            display: 'none'
                        },
                        '-ms-overflow-style': 'none',
                        'scrollbar-width': 'none'
                    }
                }
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ 
                    position: 'sticky', 
                    top: 0, 
                    bgcolor: 'background.paper', 
                    zIndex: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6" component="div">
                        Edit Event
                    </Typography>
                    <IconButton
                        onClick={handleDelete}
                        color="error"
                        sx={{ ml: 1 }}
                    >
                        <Delete />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                        {/* Basic Information Section */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                Basic Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                label="Event Title"
                                name="title"
                                type="text"
                                required
                                fullWidth
                                value={content.title}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Venue"
                                name="venue"
                                type="text"
                                required
                                fullWidth
                                value={content.venue}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Event Type</InputLabel>
                                <Select
                                    name="type"
                                    value={content.type}
                                    onChange={handleChange}
                                    label="Event Type"
                                >
                                    <MenuItem value="general">General</MenuItem>
                                    <MenuItem value="intranet">Intranet</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Date Information Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                Date Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Registration Open Date"
                                name="openDate"
                                type="date"
                                required
                                fullWidth
                                value={content.openDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Registration Close Date"
                                name="closeDate"
                                type="date"
                                required
                                fullWidth
                                value={content.closeDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Event Start Date"
                                name="eventStartDate"
                                type="date"
                                required
                                fullWidth
                                value={content.eventStartDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Event End Date"
                                name="eventEndDate"
                                type="date"
                                required
                                fullWidth
                                value={content.eventEndDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Additional Information Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                Additional Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                label="Registration Link (Optional)"
                                name="doclink"
                                type="url"
                                fullWidth
                                value={content.doclink}
                                onChange={handleChange}
                                variant="outlined"
                                placeholder="https://..."
                            />
                        </Grid>

                        {/* Existing Attachments Section */}
                        {add_attach && add_attach.length > 0 && (
                            <>
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                        Existing Attachments
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <DisplayAdditionalAttach
                                        add_attach={add_attach}
                                        setAdd_attach={setAdd_attach}
                                        deleteArray={deleteArray}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* New Attachments Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                Add New Attachments
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <AddAttachments
                                attachments={new_attach}
                                setAttachments={setNew_attach}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ 
                    position: 'sticky', 
                    bottom: 0, 
                    bgcolor: 'background.paper', 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    p: 2
                }}>
                    <Button onClick={handleClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                        sx={{ minWidth: 100 }}
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>

            <ConfirmDelete
                handleClose={() => setVerifyDelete(false)}
                modal={verifyDelete}
                event={data}
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
