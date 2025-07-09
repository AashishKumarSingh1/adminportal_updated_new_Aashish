import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import { AddAttachments } from './../common-props/add-attachment'
import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '@/context/FacultyDataContext'

export const AddSocialMediaForm = ({ handleClose, modal, links }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const refreshData = useRefreshData(false)
    const initialState = links

    const [content, setContent] = useState(links)
    const [submitting, setSubmitting] = useState(false)
    
    // Add window reference to this component
    React.useEffect(() => {
        // Expose the component instance to the window
        window.getSocialMediaLinksComponent = () => ({
            updateLinks: (newData) => {
                setContent(newData);
            }
        });
        
        // Cleanup
        return () => {
            delete window.getSocialMediaLinksComponent;
        };
    }, [])

    useEffect(() => {
        setContent(links)
    }, [links])

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
        // console.log(content)
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()
        let data = {
            ...content,
            update_social_media_links: true,
            email: session?.user?.email,
        }

        try {
            let result = await fetch('/api/update/user', {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(data),
            })
            
            const updatedData = await result.json()
            
            if (result.ok) {
                // Update the context data with the updated social media links
                updateFacultySection("user", updatedData);
                
                // Update the component's state via the window reference
                if (window.getSocialMediaLinksComponent) {
                    window.getSocialMediaLinksComponent().updateLinks(updatedData.social_media_links);
                }
                
                handleClose()
                setSubmitting(false)
                setContent(updatedData.social_media_links || initialState)
            } else {
                console.error('Error occurred:', updatedData)
                setSubmitting(false)
            }
        } catch (error) {
            console.error('Error:', error)
            setSubmitting(false)
        }
    }

    return (
        <>
            <Dialog open={modal} onClose={handleClose}>
                <form
                    onSubmit={(e) => {
                        handleSubmit(e)
                    }}
                >
                    <DialogTitle disableTypography style={{ fontSize: `2rem` }}>
                        Add Social Media Links
                    </DialogTitle>
                    <DialogContent>
                        {content &&
                            Object.keys(content).map((key, index) => {
                                return (
                                    <TextField
                                        key={index}
                                        type="url"
                                        name={key}
                                        label={key}
                                        value={content[key]}
                                        onChange={handleChange}
                                        margin="normal"
                                        fullWidth
                                    />
                                )
                            })}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting' : 'Submit'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}
