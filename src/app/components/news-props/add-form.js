import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { AddAttachments } from './../common-props/add-attachment'
import { handleNewAttachments } from './../common-props/add-attachment'
import { AddAttachments as AddImages } from './../common-props/add-image'
import { handleNewImages } from './../common-props/add-image'

export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState({
        title: '',
        description: '',
        openDate: '',
        closeDate: '',
    })

    // Match edit-form structure exactly
    const [image, setImage] = useState([])
    const [new_attach, setNew_attach] = useState([])

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            // Handle new attachments - match edit-form exactly
            let new_add_attach = []
            if (new_attach.length) {
                new_add_attach = await handleNewAttachments(new_attach)
                // Ensure keys are stored
                new_add_attach = new_add_attach.map(attachment => ({
                    ...attachment,
                    id: Date.now() + Math.random()
                }))
            }

            // Handle new images
            const uploadedImages = await handleNewImages(image)

            // Prepare final data - match edit-form structure
            const finaldata = {
                id: Date.now(),
                title: content.title,
                description: content.description,
                openDate: new Date(content.openDate).getTime(),
                closeDate: new Date(content.closeDate).getTime(),
                timestamp: Date.now(),
                email: session.user.email,
                author: session.user.name,
                image: uploadedImages,
                add_attach: new_add_attach, // Match the edit-form structure
            }

            // Send to API
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finaldata,
                    type: "news"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to create news')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error creating news:', error)
            alert('Failed to create news. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add News</DialogTitle>
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
                        label="Description"
                        name="description"
                        type="text"
                        required
                        fullWidth
                        multiline
                        rows={4}
                        value={content.description}
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

                    <AddImages
                        attachments={image}
                        setAttachments={setImage}
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
                        {submitting ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
