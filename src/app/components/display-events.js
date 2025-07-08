import {
    IconButton,
    TableFooter,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import {
    Edit,
    Flag,
    Link,
    LocationOn,
    KeyboardArrowLeft,
    KeyboardArrowRight,
} from '@material-ui/icons'
import React, { useState } from 'react'
import { AddForm } from './events-props/add-form'
import { EditForm } from './events-props/edit-form'
import { useSession } from 'next-auth/react'
import Filter from './common-props/filter'
import PropTypes from 'prop-types'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import LastPageIcon from '@material-ui/icons/LastPage'
import { useEffect } from 'react'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        boxSizing: `border-box`,
    },
    paper: {
        margin: `${theme.spacing(1)}px auto`,
        padding: `${theme.spacing(1.5)}px`,
        lineHeight: 1.5,
    },
    truncate: {
        display: `block`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: `nowrap`,
    },
    icon: {
        display: `block`,
        fontSize: `2rem`,
        marginLeft: `auto`,
        marginRight: `auto`,
    },
    attached: {
        '& > span': { paddingLeft: `8px` },
        '& > span:first-child': {
            paddingLeft: 0,
        },
    },
}))

const useStyles1 = makeStyles((theme) => ({
    root: {
        flexShrink: 0,
        marginRight: theme.spacing(2.5),
    },
}))

function TablePaginationActions(props) {
    const classes = useStyles1()
    const theme = useTheme()
    const { count, page, rowsPerPage, onPageChange } = props

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0)
    }

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1)
    }

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1)
    }

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
    }

    return (
        <div className={classes.root}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page <= 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? (
                    <LastPageIcon />
                ) : (
                    <FirstPageIcon />
                )}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page <= 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? (
                    <KeyboardArrowRight />
                ) : (
                    <KeyboardArrowLeft />
                )}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                // disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? (
                    <KeyboardArrowLeft />
                ) : (
                    <KeyboardArrowRight />
                )}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                // disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? (
                    <FirstPageIcon />
                ) : (
                    <LastPageIcon />
                )}
            </IconButton>
        </div>
    )
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
}

const DataDisplay = (props) => {
    const {data:session,status} = useSession()
    const classes = useStyles()
    const [details, setDetails] = useState(props.entries)
    const [filterQuery, setFilterQuery] = useState(null)

    //   const [rows, setRows] = useState(props.data);
    // const totalRow = [...rows]
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(15)

    // const emptyRows =
    // 	rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    useEffect(() => {
        if (!filterQuery) {
            fetch('/api/events', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',                
                },
                body: JSON.stringify({
                    from: page * rowsPerPage,
                    to: page * rowsPerPage + rowsPerPage,
                    type:"between"
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    setDetails(data)
                })
                .catch((err) => console.log(err))
        } else {
            fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    ...filterQuery,
                    from: page * rowsPerPage,
                    to: page * rowsPerPage + rowsPerPage,
                    type:"range"
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    setDetails(data)
                })
                .catch((err) => console.log(err))
        }

        // setDetails(await response.json());

        console.log('page : ', page)
        console.log('rowperpage : ', rowsPerPage)

        // console.log(response.json());
    }, [page, rowsPerPage, filterQuery])

    const [addModal, setAddModal] = useState(false)
    const addModalOpen = () => {
        setAddModal(true)
    }
    const handleCloseAddModal = () => {
        setAddModal(false)
    }

    const Event = ({ detail }) => {
        let openDate = new Date(detail.openDate)
        let dd = openDate.getDate()
        let mm = openDate.getMonth() + 1
        let yyyy = openDate.getFullYear()
        openDate = dd + '/' + mm + '/' + yyyy
        
        // Safely parse event_link
        const [event_link, setEvent_link] = useState(() => {
            if (!detail.event_link) return null;
            try {
                return typeof detail.event_link === 'string' ? 
                    JSON.parse(detail.event_link) : 
                    detail.event_link;
            } catch (e) {
                console.error('Error parsing event_link:', e);
                return null;
            }
        });

        const [editModal, setEditModal] = useState(false)

        const editModalOpen = () => {
            setEditModal(true)
        }

        const handleCloseEditModal = () => {
            setEditModal(false)
        }

        return (
            <React.Fragment key={detail.id}>
                <Grid item xs={12} sm={8} lg={10}>
                    <Paper
                        className={classes.paper}
                        style={{ minHeight: `50px`, position: `relative` }}
                    >
                        <span className={classes.truncate}>{detail.title}</span>
                        <div className={classes.attached}>
                            {event_link && (
                                <span
                                    style={{
                                        display: `inline-flex`,
                                        margin: `5px 0 `,
                                    }}
                                >
                                    <Flag color="secondary" />
                                    <a
                                        href={event_link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {event_link.caption}
                                    </a>
                                </span>
                            )}

                            {detail.attachments && 
                                (typeof detail.attachments === 'string' ? 
                                    JSON.parse(detail.attachments) : 
                                    detail.attachments
                                ).map((attachment, idx) => {
                                    return (
                                        <span
                                            key={idx}
                                            style={{
                                                display: `inline-flex`,
                                                margin: `5px 0 `,
                                            }}
                                        >
                                            <Flag />
                                            <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {attachment.caption}
                                            </a>
                                        </span>
                                    )
                                })
                            }
                            <span
                                style={{
                                    display: `inline-flex`,
                                    margin: `5px 0 `,
                                }}
                            >
                                <LocationOn color="secondary" />
                                {detail.venue}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <div>Uploaded By : {detail.email} </div>
                            <div>Updated By: {detail.updatedBy} </div>
                            <div>Open Date: {openDate}</div>
                        </div>
                    </Paper>
                </Grid>

                <Grid item xs={6} sm={2} lg={1}>
                    <Paper
                        className={classes.paper}
                        style={{ textAlign: `center` }}
                    >
                        <a
                            href={detail.doclink}
                            style={{ textDecoration: `none` }}
                        >
                            <Link className={classes.icon} />
                            <span>Event Attach/Link</span>
                        </a>
                    </Paper>{' '}
                </Grid>
                {session.user.role === 'SUPER_ADMIN' || 
                 session.user.role === 'ACADEMIC_ADMIN' || 
                 session.user.role === 'DEPT_ADMIN' ||
                 session.user.email === detail.email ? (
                    <Grid item xs={6} sm={2} lg={1}>
                        <Paper
                            className={classes.paper}
                            style={{ textAlign: `center`, cursor: `pointer` }}
                            onClick={editModalOpen}
                        >
                            <Edit className={classes.icon} /> <span>Edit</span>
                        </Paper>{' '}
                        <EditForm
                            data={detail}
                            modal={editModal}
                            handleClose={handleCloseEditModal}
                        />
                    </Grid>
                ) : (<>
                </>
                )}
            </React.Fragment>
        )
    }

    return (
        <div style={{ alignItems: 'center' }}>
            <header>
                <Typography variant="h4" style={{ margin: `15px 0` }}>
                    Recent Events
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={addModalOpen}
                    style={{ display: 'inline' }}
                >
                    ADD +
                </Button>
                <Filter type="events" setEntries={setFilterQuery} />
            </header>

            <AddForm handleClose={handleCloseAddModal} modal={addModal} />

            <Grid container spacing={2} className={classes.root}>
            {(details && details.length > 0) ? details.map((row, index) => (
                <Event key={index} detail={row} />
            )) : null}
            </Grid>

            <TableFooter>
                <TableRow>
                    <TablePagination
                        rowsPerPageOptions={[15, 25, 50, 100]}
                        colSpan={7}
                        count={details?.length || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        selectprops={{
                            inputProps: { 'aria-label': 'rows per page' },
                            native: true,
                        }}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        ActionsComponent={TablePaginationActions}
                    />
                </TableRow>
            </TableFooter>

        </div>
    )
}

export default DataDisplay
