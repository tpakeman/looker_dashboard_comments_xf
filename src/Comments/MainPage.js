import React, { useState, useEffect, useContext, useCallback }  from "react"
import { ExtensionContext } from '@looker/extension-sdk-react'
import { LookerEmbedSDK } from '@looker/embed-sdk'
import { lookerCaller } from '../utils'
import {
     Box, Heading, Select, TextArea, Button, Divider, List, ListItem, MessageBar, Card, CardContent, Paragraph, Spinner,
} from '@looker/components'
import { DashboardFile } from '@looker/icons'
import { EmbedContainer } from './CustomComponents'

const FolderPicker = (props) => {
    const [selection, setSelection] = useState(undefined)
    const [searchTerm, setSearchTerm] = useState(undefined)
    const handleSelect = (e) => {
        setSelection(e)
        props.chooseFolder(e)
    }
    const handleFilter = (t) => {setSearchTerm(t)}
    
    return (
        <Box width='100%' mb='large'>
            <Heading as='h2' mb='small'>Choose Folder</Heading>
            <Select
                isFilterable
                placeholder={'Choose a folder'}
                value={selection}
                options={searchTerm ? props.data.filter(d => d.label.toLowerCase().includes(searchTerm.toLowerCase())) : props.data}
                onChange={handleSelect}
                onFilter={handleFilter}
            />
        </Box>
    )
}

const DashboardList = (props) => {
    const [dashboards, setDashboards] = useState([])
    const [selection, setSelection] = useState(undefined)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        if (props.folder) {
            setLoading(true)
            props.lookerRequest('folder_dashboards', props.folder).then(d => {
                setDashboards(d)
                setLoading(false)
            })
        }
    }, [props.folder])

    const handleClick = (e) => {
        setSelection(e.id)
        props.handleSelect(e)
    }

    return (
        <Box width='100%'>
            {props.folder && <>
            <Heading as='h4' mb='small'>Dashboards</Heading>
            <Divider mb='small'/>
                <List>
                    {loading ? <Spinner/> : dashboards.length == 0 && <Heading as='h5'>No Dashboards in folder</Heading>}
                    {dashboards.map(d => {
                        return (
                            <ListItem
                                style={{borderLeft: d.id==selection?'4px solid rgb(45, 126, 234)':'none'}}
                                onClick={() => handleClick(d)}
                                key={d.id}
                                icon={<DashboardFile/>}
                            >
                                {d.title}
                            </ListItem>
                        )  
                    })}
                </List></>
            }
        </Box>
    )
}


const DashboardDisplay = (props) => {
    const extensionContext = useContext(ExtensionContext)
    const [dashboard, setDashboard] = useState(undefined)

    const embedCtrRef = useCallback((el) => {
        const hostUrl = extensionContext?.extensionSDK?.lookerHostData?.hostUrl
        if (el && hostUrl) {
          el.innerHTML = ''
          LookerEmbedSDK.init(hostUrl)
          const dash = LookerEmbedSDK.createDashboardWithId(Number(props.dashboard.id))
          dash.appendTo(el)
            .build()
            .connect()
            .then((d) => setDashboard(d))
            .catch((e) => {console.error('Connection error', e)})
        }
      },
      [props.dashboard]
    )


    return (
        <Box p='xlarge'>
            {props.dashboard && 
                <>
                    <Heading as='h2'>Dashboard</Heading>
                    <EmbedContainer ref={embedCtrRef}/>
                </>
            }
        </Box>
    )
}

const AvatarIcon = (props) => {
    return (
        <img display='inline' src={props.src} style={{borderRadius: '50%'}} width='50px' height='50px'/>
    )
}

// three possible outcomes - no comments, comments, other description
const CommentDisplay = (props) => {
    const [commentData, setCommentData] = useState([])
    const [validForComments, setValidForComments] = useState(false)
    const [invalidDescription, setInvalidDescription] = useState(undefined)
    const [newCommentText, setNewCommentText] = useState('')
    const submitComment = () => {
        let tmp = commentData
        let curMax = Math.max(...tmp.map(c => Number(c.id))) || 0
        let newComment = {
            id: Number(curMax + 1),
            author: props.me.display_name,
            timestamp: new Date().toDateString(),
            msg: newCommentText,
            avatar: props.me.avatar_url
        }
        console.log(newComment)
        tmp.push(newComment)
        props.lookerRequest('update_dashboard', props.dashboard.id, {
            description: JSON.stringify(commentData)
        })
        setCommentData(tmp)
        setNewCommentText('')
        setValidForComments(true)
        setInvalidDescription(false)
    }

    const parseToJson = (commentText) => {
        try {
            return JSON.parse(commentText)
        } catch (SyntaxError) {
            return false
        }
    }

    const resetCommentState = () => {
        setCommentData([])
        setValidForComments(false)
        setInvalidDescription(undefined)
        setNewCommentText('')
    }

    const makeReadyForComments = () => {
        setCommentData([])
        setValidForComments(true)
        setInvalidDescription(undefined)
    }

    const handleCommentEntry = (e) => {
        setNewCommentText(e.target.value)
    }

    useEffect(() => {
        if (props.dashboard) {
            resetCommentState()
            // Attempt to parse existing comments
            let parsed = parseToJson(props.dashboard?.description)
            // Existing comments 
            if (parsed) {
                setCommentData(parsed)
                setValidForComments(true)
            } else {
                setCommentData([])
            // Existing description
                if (props.dashboard.description.length > 0) {
                    setValidForComments(false)
                    setInvalidDescription(props.dashboard.description)
                } else {
                    // Empty Comments
                    setValidForComments(true)
                }
            }
        }
    }, [props.dashboard])

    if (props.dashboard) {
        return (
            <Box p='xlarge' height='auto' overflow='scroll'>
            <Divider mb='small'/>
            <Heading as='h2'>Comments</Heading>
            {invalidDescription && 
                <Box m='small'>
                    <MessageBar m='small' intent='critical'>Enabling comments will overwrite existing description: "{invalidDescription}"</MessageBar>
                    <Button m='small' color='critical' onClick={makeReadyForComments}>Delete current description to enable comments</Button>
                </Box>
                }
            {validForComments && 
                <Box m='large'>
                    {commentData.length > 0 
                        ? commentData.map(c => {return <CommentCard key={c.id} {...c} />})
                        : <Card width='50%' height='50px' p='medium' style={{backgroundColor: 'lightgrey'}}><Heading as='h5'>No comments yet!</Heading></Card>
                    }
                    <Divider mt='medium' mb='medium'/>
                    <TextArea
                        m='xsmall'
                        placeholder={'Add a new comment'}
                        value={newCommentText}
                        onChange={handleCommentEntry}
                    />
                    <Button m='xsmall' onClick={submitComment}>Submit</Button>
                </Box>
            }
        </Box>
    )
    } else {
        return (<></>)
    }
}

const CommentCard = (props) => {
    return (
        <Card
            height='auto'
            display='block'
            m='medium'
            width='80%'
            style={{float: props.id % 2 == 0 ? 'right' : 'left'}}
        >
            <CardContent>
                {props.avatar && <AvatarIcon src={props.avatar}/>}
                <Heading display='inline' as='h4'>{props.author}</Heading>
                <Heading as='h6'>{props.timestamp}</Heading>
                <Paragraph>
                    {props.msg}
                </Paragraph>
            </CardContent>
        </Card>
    )
}

const SideNav = (props) => {
    const [targetFolder, setTargetFolder] = useState(undefined)
    const handleChooseFolder = (f) => setTargetFolder(f)

    return (
        <Box
            // height='100%'
            width='25%'
            // borderRight='1px solid grey'
            p='medium'
        >
            <FolderPicker
                data={props.folders}
                chooseFolder={handleChooseFolder}
            />
            <DashboardList
                folder={targetFolder}
                handleSelect={props.handleSelect}
                lookerRequest={props.lookerRequest}
            />
            <Box bottom='0' position='fixed'>
                <Paragraph m='small' fontSize='small' textAlign='right'>Made by Tom Pakeman. <a target='_blank' href="https://github.com/tpakeman/looker_dashboard_comments_xf">Click here for source code</a></Paragraph>
            </Box>
        </Box>
    )
}

const MainFrame = (props) => {
    return (
        <Box height='100%' width='100%' >
        <DashboardDisplay
            dashboard={props.dashboard}
        />
        <CommentDisplay
            me={props.me}
            dashboard={props.dashboard}
            lookerRequest={props.lookerRequest}
        />
        </Box>
    )
}

export const MainPage = () => {
    const extensionContext = useContext(ExtensionContext);
    const lookerRequest = lookerCaller(extensionContext.core40SDK);
    const [folderData, setFolderData] = useState([])
    const [dashboard, setDashboard] = useState(undefined)
    const [me, setMe] = useState(undefined)
    const handleChooseDashboard = (d) => setDashboard(d)

    useEffect(() => {
        lookerRequest('all_folders').then((r) => {
            let tmp = r.map(f => {return {label: f.name, value: f.id}})
            setFolderData(tmp)
        })
        lookerRequest('me').then((r) => {
            setMe(r)
        })
    }, [])
    

    return (
        <>
            <SideNav
                folders={folderData}
                handleSelect={handleChooseDashboard}
                lookerRequest={lookerRequest}
            />
            <MainFrame
                me={me}
                dashboard={dashboard}
                lookerRequest={lookerRequest}
            />
        </>
    )
}