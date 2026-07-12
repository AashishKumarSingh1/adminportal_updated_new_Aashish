'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material'
import { useState } from 'react'
import { DEFAULT_CLUB_FORM } from '@/lib/clubConstants'
import { inputToPictures } from '@/lib/clubUtils'
import { ClubFormFields } from './ClubFormFields'
import Toast from '@/app/components/common/Toast'

export function AddClub({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ ...DEFAULT_CLUB_FORM })
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' })

  const handleClose = () => {
    setFormData({ ...DEFAULT_CLUB_FORM })
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      setToast({ open: true, severity: 'error', message: 'Club name and email are required' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pictures: inputToPictures(formData.picturesInput),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add club')

      setToast({
        open: true,
        severity: 'success',
        message: data.credentials?.message || 'Club created successfully',
      })
      onSuccess(data.club)
      handleClose()
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ backgroundColor: '#830001', color: 'white' }}>Add New Club</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <ClubFormFields formData={formData} onChange={setFormData} superAdminAdd={true} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#830001' }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Add Club'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} handleClose={() => setToast({ ...toast, open: false })} />
    </>
  )
}
