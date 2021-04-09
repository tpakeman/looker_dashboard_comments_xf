import React, { useState, useEffect, useContext, useCallback }  from "react"
import { ExtensionContext } from '@looker/extension-sdk-react'
import { LookerEmbedSDK } from '@looker/embed-sdk'
import { lookerCaller } from '../utils'
import {
    Flex, Box, Heading, Select, InputText, Button, Divider, List, ListItem, Space, MessageBar, Card, CardContent, Paragraph, Spinner,
} from '@looker/components'
import { DashboardFile } from '@looker/icons'
import { EmbedContainer } from './CustomComponents'

const FolderPicker = (props) => {
    const [selection, setSelection] = useState(undefined)
    const handleSelect = (e) => {
        setSelection(e)
        props.chooseFolder(e)
    }
    return (
        <Box width='100%' mb='large'>
            <Heading as='h2' mb='small'>Choose Folder</Heading>
            <Select
                value={selection}
                options={props.data}
                onChange={handleSelect}
            />
        </Box>
    )
}

const DashboardList = (props) => {
    const [dashboards, setDashboards] = useState([])
    const [selection, setSelection] = useState(undefined)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        props.lookerRequest('folder_dashboards', props.folder).then(d => {
            setDashboards(d)
            setLoading(false)
        })
    }, [props.folder])

    const handleClick = (e) => {
        setSelection(e.id)
        props.handleSelect(e)
    }

    return (
        <Box width='100%'>
            <Heading as='h4' mb='small'>Dashboards</Heading>
            <Divider mb='small'/>
            <List>
                {loading && <Spinner/>}
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
            </List>
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
        <Box p='xlarge' height='60%'>
            {props.dashboard && 
                <>
                    <Heading as='h2'>Dashboard</Heading>
                    <EmbedContainer ref={embedCtrRef}/>
                </>
            }
        </Box>
    )
}

// three possible outcomes - no comments, comments, other description
const CommentDisplay = (props) => {
    const [commentData, setCommentData] = useState([])
    const [validComment, setValidComment] = useState(true)
    const [invalidDescription, setInvalidDescription] = useState(undefined)
    const [newCommentText, setNewCommentText] = useState('')
    const submitComment = () => {
        let tmp = commentData
        let curMax = Math.max(tmp.map(c => c.id))
        let newComment = {
            id: curMax + 1,
            author: props.me.display_name,
            timestamp: new Date().toDateString(),
            msg: newCommentText
        }
        tmp.push(newComment)
        props.lookerRequest('update_dashboard', props.dashboard.id, {
            description: JSON.stringify(commentData)
        })
        setCommentData(tmp)
        setNewCommentText('')
        setValidComment(true)
        setInvalidDescription(false)
        // avatar?
    }

    const parseToJson = (commentText) => {
        try {
            return JSON.parse(commentText)
        } catch (SyntaxError) {
            return false
        }
    }

    const handleCommentEntry = (e) => {
        setNewCommentText(e.target.value)
    }

    useEffect(() => {
        if (props.dashboard) {
            let parsed = parseToJson(props.dashboard?.description)
            if (parsed) {
                setCommentData(parsed)
            } else {
                if (props.dashboard.description.length > 0) {
                    setValidComment(false)
                    setInvalidDescription(props.dashboard.description)
                }
                setCommentData([])
            }
        }
    }, [props.dashboard])

    return (
        <Box p='xlarge' height='auto'>
            <Divider mb='small'/>
            <Heading as='h2'>Comments</Heading>
                {(!validComment && invalidDescription)
                    && <MessageBar intent='critical'>Existing description exists!
                    {invalidDescription}</MessageBar>
                    }
                {commentData.map(c => {
                    return <CommentCard key={c.id} {...c} />
                })}
            <Divider mb='small'/>
            <InputText
                m='xsmall'
                placeholder={'Add a new comment'}
                value={newCommentText}
                onChange={handleCommentEntry}
            />
            <Button m='xsmall' onClick={submitComment}>Submit</Button>
        </Box>
    )
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
                <Heading as='h4'>{props.author}</Heading>
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
            borderRight='1px solid grey'
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