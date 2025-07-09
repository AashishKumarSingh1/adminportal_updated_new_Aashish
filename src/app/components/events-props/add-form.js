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
    Grid,
    Typography,
    Divider,
    Box
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { AddAttachments } from './../common-props/add-attachment'
import { handleNewAttachments } from './../common-props/add-attachment'


export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState({
        title: '',
        openDate: '',
        closeDate: '',
        venue: '',
        doclink: '',
        eventStartDate: '',
        eventEndDate: '',
        type: 'general',
    })

    const [new_attach, setNew_attach] = useState([])
   

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            let attachments = []
            if (new_attach.length) {
                const processedAttachments = await handleNewAttachments(new_attach)
                attachments = processedAttachments.map(attachment => ({
                    id: Date.now() + Math.random(),
                    caption: attachment.caption,
                    url: attachment.url,
                    typeLink: attachment.typeLink
                }))
            }

            const finaldata = {
                id: Date.now(),
                title: content.title,
                openDate: new Date(content.openDate).getTime(),
                closeDate: new Date(content.closeDate).getTime(),
                eventStartDate: new Date(content.eventStartDate).getTime(),
                eventEndDate: new Date(content.eventEndDate).getTime(),
                venue: content.venue,
                doclink: content.doclink,
                type: content.type,
                timestamp: Date.now(),
                email: session.user.email,
                author: session.user.name,
                event_link: null,
                attachments: JSON.stringify(attachments)
            }

            const result = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finaldata,
                    type: "event"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to create event')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error creating event:', error)
            alert('Failed to create event. Please try again.')
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
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6" component="div">
                        Create New Event
                    </Typography>
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

                        {/* Attachments Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                Attachments
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
                        {submitting ? 'Creating...' : 'Create Event'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
