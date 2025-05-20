'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material'
import { useState } from 'react'
import { ROLES } from '@/lib/roles'
import { depList } from '@/lib/const'
import Toast from '@/app/components/common/Toast'

export function AddFaculty({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    role: ''
  })
  const [toast, setToast] = useState({
    open: false,
    severity: 'success',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          ...formData,
          // email: session?.user?.email
        })
      })

      if (!res.ok) throw new Error('Failed to add faculty')

      const newFaculty = await res.json()
      onSuccess(newFaculty)
      setFormData({
        name: '',
        email: '',
        department: '',
        designation: '',
        role: '',
        ext_no: '',
        research_interest: '',
        is_retired: false,
        retirement_date: null
      })
      setToast({
        open: true,
        severity: 'success',
        message: 'Faculty added successfully!'
      })
      window.location.reload()
    } catch (error) {
      console.error('Error adding faculty:', error)
      alert('Failed to add faculty')
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Faculty</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Department"
                required
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              >
                {[...depList].map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
                <MenuItem value="developer">Developer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ext No"
                value={formData.ext_no}
                onChange={(e) => setFormData(prev => ({ ...prev, ext_no: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Research Interest"
                value={formData.research_interest}
                onChange={(e) => setFormData(prev => ({ ...prev, research_interest: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                required
                label="Is Retired"
                value={formData.is_retired}
                onChange={(e) => setFormData(prev => ({ ...prev, is_retired: e.target.value }))}
              >
                <MenuItem key="1" value="1">Yes</MenuItem>
                <MenuItem key="0" value="0">No</MenuItem>
              </TextField>
            </Grid>
            {formData.is_retired === '1' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Retirement Date"
                value={formData.retirement_date}
                onChange={(e) => setFormData(prev => ({ ...prev, retirement_date: e.target.value }))}
              />
            </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Role"
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {key}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Faculty'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
