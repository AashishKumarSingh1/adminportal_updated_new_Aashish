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
import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '@/context/FacultyDataContext'

export const AddResearch = ({ handleClose, modal, detail }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    
    // Add window component reference
    React.useEffect(() => {
        // Expose the component instance to the window
        window.getResearchComponent = () => ({
            updateResearch: (newData) => {
                // Update local state if needed
            }
        });
        
        // Cleanup
        return () => {
            delete window.getResearchComponent;
        };
    }, []);
    
    const initialState = {
        id: `${detail?.id || ''}`,
        name: `${detail?.name || ''}`,
        email: `${detail?.email || ''}`,
        role: `${detail?.role || ''}`,
        department: `${detail?.department || ''}`,
        designation: `${detail?.designation || ''}`,
        ext_no: `${detail?.ext_no || ''}`,
        research_interest: `${detail?.research_interest || ''}`,
    }
    const [content, setContent] = useState(initialState)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()
        let data = {
            ...content,
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
                // Update the context data with the updated research
                updateFacultySection("user", updatedData);
                
                // Update the component's state via the window reference if needed
                if (window.getResearchComponent) {
                    window.getResearchComponent().updateResearch(updatedData);
                }
                
                handleClose()
                setSubmitting(false)
                setContent(initialState)
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
                        Add Profile Data
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            id="label"
                            label="ext_no"
                            name="ext_no"
                            type="text"
                            fullWidth
                            onChange={(e) => handleChange(e)}
                            value={content.ext_no}
                        />
                        <TextField
                            margin="dense"
                            id="label"
                            label="research_interest"
                            name="research_interest"
                            type="text"
                            fullWidth
                            onChange={(e) => handleChange(e)}
                            value={content.research_interest}
                        />
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
