import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React from 'react'
import useRefreshData from '@/custom-hooks/refresh'

export const ConfirmDelete = ({
    handleClose,
    modal,
    id,
    del,
    scrolltoTop = false,
    callback = async () => {},
}) => {
    const { data: session } = useSession()
    const refreshData = useRefreshData(scrolltoTop)
    let data = {
        id: id,
        email: session.user.email,
    }
    const deleteEvent = async () => {
        let result = await fetch(`/api/delete/${del}`, {
            method: 'DELETE',
            body: JSON.stringify(data),
        })
        result = await result.json()
        if (result instanceof Error) {
            console.log('Error Occured')
            // console.log(result)
        } else await callback()
        // console.log(result)
        handleClose()
        refreshData()
    }

    return (
        <div>
            <Dialog open={modal} onClose={handleClose}>
                <DialogTitle id="alert-dialog-title">
                    {'Do you want to REMOVE ?'}
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
