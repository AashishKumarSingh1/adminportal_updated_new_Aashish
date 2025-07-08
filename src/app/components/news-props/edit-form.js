import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton
} from '@mui/material'
import { Delete, Link } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import React, { useRef, useState } from 'react'
import { dateformatter } from './../common-props/date-formatter'
import { ConfirmDelete } from './confirm-delete'
import { handleNewAttachments } from './../common-props/add-attachment'
import { AddAttachments as AddImages } from './../common-props/add-image'
import { AddAttachments } from './../common-props/add-attachment'
import { handleNewImages } from './../common-props/add-image'

export const EditForm = ({ data, handleClose, modal }) => {
    const limit = 1
    const deleteArray = useRef([])
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const [content, setContent] = useState({
        id: data.id,
        title: data.title,
        openDate: dateformatter(data.openDate),
        closeDate: dateformatter(data.closeDate),
        description: data.description,
    })
    const [submitting, setSubmitting] = useState(false)

    const [verifyDelete, setVerifyDelete] = useState(false)
    const handleDelete = () => {
        setVerifyDelete(false)
    }

    const [image, setImage] = useState(
        Array.isArray(data.image) ? data.image : []
    )
    const [newImages, setNewImages] = useState([])

    const [add_attach, setAdd_attach] = useState(
        Array.isArray(data.attachments) ? data.attachments : []
    )
    const [new_attach, setNew_attach] = useState([])

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
        //console.log(content)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
           
            // Handle new attachments
            let new_add_attach = []
            if (new_attach.length) {
                new_add_attach = await handleNewAttachments(new_attach)
            }

            // Handle new images
            const uploadedImages = await handleNewImages(image);

            // Prepare final data
            const finaldata = {
                ...content,
                openDate: new Date(content.openDate).getTime(),
                closeDate: new Date(content.closeDate).getTime(),
                timestamp: Date.now(),
                email: session.user.email,
                author: session.user.name,
                image: uploadedImages,
                add_attach: [...add_attach, ...new_add_attach],
            }

            // Update the news
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finaldata,
                    type: "news"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to update news')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error updating news:', error)
            // You might want to show an error message to the user here
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle
                    disableTypography
                    style={{ fontSize: `2rem`, position: 'relative' }}
                >
                    Edit News
                    <i
                        style={{
                            position: `absolute`,
                            right: `15px`,
                            cursor: `pointer`,
                        }}
                    >
                        <Delete
                            type="button"
                            onClick={() => setVerifyDelete(true)}
                            style={{ height: `2rem`, width: `auto` }}
                            color="secondary"
                        />
                    </i>
                </DialogTitle>
                <ConfirmDelete
                    modal={verifyDelete}
                    handleClose={handleDelete}
                    news={data}
                />
                <DialogContent>
                    <TextField
                        margin="dense"
                        id="label"
                        label="Title"
                        name="title"
                        type="text"
                        required
                        fullWidth
                        placeholder="Title"
                        onChange={(e) => handleChange(e)}
                        value={content.title}
                    />
                    <TextField
                        margin="dense"
                        id="desc"
                        label="Description"
                        type="text"
                        fullWidth
                        placeholder={'Description'}
                        name="description"
                        required
                        onChange={(e) => handleChange(e)}
                        value={content.description}
                    />
                    <TextField
                        margin="dense"
                        id="openDate"
                        label="Open Date"
                        name="openDate"
                        type="date"
                        required
                        value={content.openDate}
                        onChange={(e) => handleChange(e)}
                        fullWidth
                    />
                    <TextField
                        id="closeDate"
                        label="Close Date"
                        name="closeDate"
                        margin="dense"
                        required
                        type="date"
                        onChange={(e) => handleChange(e)}
                        value={content.closeDate}
                        fullWidth
                    />

                    
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
        </Dialog>
    )
}

const DisplayImages = ({ image, setImage, deleteArray }) => {
    const handleRemove = (idx, fileId) => {
        const values = [...image]
        if (fileId) {
            deleteArray.current.push(fileId)
        }
        values.splice(idx, 1)
        setImage(values)
    }

    return (
        <div>
            {image.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <TextField
                        label={`Image ${idx + 1}`}
                        value={file.caption || ''}
                        disabled
                        fullWidth
                    />
                    {file.url && (
                        <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center' 
                            }}
                        >
                            <Link style={{ marginRight: '5px' }} />
                            View
                        </a>
                    )}
                    <Delete
                        onClick={() => handleRemove(idx, file.id)}
                        style={{
                            cursor: 'pointer',
                            color: '#d32f2f'
                        }}
                    />
                </div>
            ))}
        </div>
    )
}

const DisplayAdditionalAttach = ({ add_attach, setAdd_attach, deleteArray }) => {
    const handleAttachments = (e, idx) => {
        let attach = [...add_attach]
        attach[idx].caption = e.target.value
        setAdd_attach(attach)
    }

    const deleteAttachment = (idx) => {
        // Only add to deleteArray if the attachment has a URL with a file ID
        if (add_attach[idx].url && add_attach[idx].url.includes('drive.google.com')) {
            const fileId = add_attach[idx].url.split('/')[5]
            deleteArray.current.push(fileId)
        }
        let atch = [...add_attach]
        atch.splice(idx, 1)
        setAdd_attach(atch)
    }

    return (
        <>
            {add_attach && add_attach.length > 0 && (
                <>
                    <h2>Additional Attachments</h2>
                    {add_attach.map((attachment, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <TextField
                                id={`attachment-${idx}`}
                                margin="dense"
                                type="text"
                                value={attachment.caption || ''}
                                onChange={(e) => handleAttachments(e, idx)}
                                fullWidth
                                label={`Attachment ${idx + 1}`}
                                InputLabelProps={{
                                    shrink: true,
                                }}
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
            )}
        </>
    )
}
