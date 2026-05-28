'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { DEFAULT_CLUB_FORM } from '@/lib/clubConstants'
import { picturesToInput, inputToPictures } from '@/lib/clubUtils'
import { ClubFormFields } from './ClubFormFields'
import Toast from '@/app/components/common/Toast'

function clubToForm(club) {
  if (!club) return { ...DEFAULT_CLUB_FORM }
  return {
    id: club.id,
    club_login_id: club.club_login_id || '',
    name: club.name || '',
    email: club.email || '',
    category: club.category || 'Technical',
    status: club.status || 'Active',
    description: club.description || '',
    about: club.about || '',
    logo: club.logo || '',
    picturesInput: picturesToInput(club.pictures),
    patna_campus_pi: club.patna_campus_pi || DEFAULT_CLUB_FORM.patna_campus_pi,
    bihta_campus_pi: club.bihta_campus_pi || DEFAULT_CLUB_FORM.bihta_campus_pi,
    club_president: club.club_president || '',
    club_secretary: club.club_secretary || '',
  }
}

export function EditClub({ open, club, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ ...DEFAULT_CLUB_FORM })
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' })

  useEffect(() => {
    if (club) setFormData(clubToForm(club))
  }, [club])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clubs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          club_login_id: formData.club_login_id,
          name: formData.name,
          email: formData.email,
          category: formData.category,
          status: formData.status,
          description: formData.description,
          about: formData.about,
          logo: formData.logo,
          pictures: inputToPictures(formData.picturesInput),
          patna_campus_pi: formData.patna_campus_pi,
          bihta_campus_pi: formData.bihta_campus_pi,
          club_president: formData.club_president,
          club_secretary: formData.club_secretary,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update club')
      setToast({ open: true, severity: 'success', message: 'Club updated successfully' })
      onSuccess(data.club)
      onClose()
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ backgroundColor: '#830001', color: 'white' }}>
            Edit Club — {club?.name}
          </DialogTitle>
          <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
            <ClubFormFields formData={formData} onChange={setFormData} showExtended />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#830001' }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} handleClose={() => setToast({ ...toast, open: false })} />
    </>
  )
}
