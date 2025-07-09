import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React from 'react'

export const ConfirmDelete = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const deleteEvent = async () => {
        let result = await fetch('/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'user',
                email: session?.user?.email
            })
        })
        result = await result.json()
        if (result instanceof Error) {
            console.log('Error Occured')
            console.log(result)
        }
        console.log(result)

        window.location.reload()
    }

    return (
        <div>
            <Dialog open={modal} onClose={handleClose}>
                <DialogTitle id="alert-dialog-title">
                    {'Do you want to DELETE details of this Faculty ?'}
                </DialogTitle>

                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => deleteEvent()}
                        color="secondary"
                    >
                        Delete
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
