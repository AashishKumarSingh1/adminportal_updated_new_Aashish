import { 
    Button, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    Box,
    TextField,
    Grid
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { useFacultyData } from '../../../context/FacultyDataContext'

export const EditProfile = ({ handleClose, modal, currentProfile, onUpdate }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        research_interest: currentProfile?.research_interest || '',
        ext_no: currentProfile?.ext_no || '',
        linkedin: currentProfile?.linkedin || '',
        google_scholar: currentProfile?.google_scholar || '',
        personal_webpage: currentProfile?.personal_webpage || '',
        scopus: currentProfile?.scopus || '',
        vidwan: currentProfile?.vidwan || '',
        orcid: currentProfile?.orcid || ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            const response = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'profile',
                    email: session.user.email,
                    ...formData
                }),
            })

            if (!response.ok) throw new Error('Failed to update profile')
            
            // Update the faculty data context with new profile data
            updateFacultySection('profile', formData)
            
            // Update parent component if callback provided
            if (onUpdate) {
                onUpdate(formData)
            }

            handleClose()
        } catch (error) {
            console.error('Error:', error)
            setError(error.message || 'Failed to update profile')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Profile Details</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Research Interest"
                                name="research_interest"
                                value={formData.research_interest}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="ext_no"
                                value={formData.ext_no}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="LinkedIn Profile"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Google Scholar"
                                name="google_scholar"
                                value={formData.google_scholar}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Personal Webpage"
                                name="personal_webpage"
                                value={formData.personal_webpage}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Scopus"
                                name="scopus"
                                value={formData.scopus}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Vidwan"
                                name="vidwan"
                                value={formData.vidwan}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="ORCID"
                                name="orcid"
                                value={formData.orcid}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
} 