import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext()
function ChatProvider({ children }) {
    const [user, setUser] = useState()
    const [selectedChat, setSelectedChat] = useState()
    const [notification, setNotification] = useState([]);

    const [chats, setChats] = useState([])

    // console.log(selectedChat)
    // console.log(chats)

    const navigate = useNavigate();
    // console.log(user)
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        setUser(userInfo?.user)

        if (!userInfo) {
            navigate('/');
        }
    }, [navigate])
    return (
        <ChatContext.Provider value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification }}>
            {children}
        </ChatContext.Provider>
    )
}

// export default  ChatProvider
export { ChatContext, ChatProvider }