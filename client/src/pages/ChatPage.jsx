import React from 'react'
import { useContext, useState } from 'react'
import { ChatContext } from '../context/ChatProvider'
import SideDrawer from '../components/miscellaneous/SideDrawer'
import { Box } from "@chakra-ui/layout";
import MyChat from '../components/MyChat'
import ChatBox from '../components/ChatBox'
function ChatPage() {
    const { user } = useContext(ChatContext)
    const [fetchAgain, setFetchAgain] = useState(false);

    // console.log(user)
    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}

            <Box display="flex" justifyContent="space-between" width="100%" height="91.5vh" padding="10px">
                {user && <MyChat
                    fetchAgain={fetchAgain}
                />}
                {user && (
                    <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                )}
            </Box>
        </div>
    )
}

export default ChatPage