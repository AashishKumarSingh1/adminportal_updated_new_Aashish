import React from 'react'
import { Button, TextField, FormControlLabel, Checkbox } from '@mui/material'
import { Delete } from '@mui/icons-material'

export const UpdateMainAttachment = ({ attachment, setAttachment }) => {
    function handleChangeSubTitle(event) {
        setAttachment({
            ...attachment,
            caption: event.target.value,
        })
    }

    function handleChangeFile(event) {
        setAttachment({
            ...attachment,
            url: event.target.files[0],
            value: event.target.value,
        })
    }

    function handleType() {
        setAttachment({
            ...attachment,
            typeLink: !attachment.typeLink,
        })
    }

    function handleLink(event) {
        setAttachment({
            ...attachment,
            url: event.target.value,
        })
    }

    return (
        <div style={{ marginTop: `8px` }}>
            <div>
                <h2>New Main Attachment</h2>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={attachment.typeLink}
                            onChange={() => handleType()}
                            name="typeLink"
                            color="primary"
                        />
                    }
                    style={{ width: `20%` }}
                    label="Link"
                />
                <TextField
                    placeholder="SubTitle"
                    name="caption"
                    value={attachment.caption}
                    fullWidth
                    onChange={(e) => handleChangeSubTitle(e)}
                    style={{ margin: `8px`, display: 'inline' }}
                />
                <div style={{ display: 'flex' }}>
                    {attachment.typeLink ? (
                        <TextField
                            placeholder="File Link"
                            name="link"
                            value={attachment.url ?? ''}
                            onChange={(e) => handleLink(e)}
                            style={{ margin: `8px`, width: `90%` }}
                        />
                    ) : (
                        <TextField
                            type="file"
                            name="url"
                            files={attachment.url}
                            style={{ margin: `8px` }}
                            onChange={(e) => {
                                handleChangeFile(e)
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
