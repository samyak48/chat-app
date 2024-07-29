import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { ChatContext } from '../context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSenderAgain, getSenderFull } from '../config/ChatLogic'
import ProfileModel from './miscellaneous/ProfileModel'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal'
import ScrollableChat from './scrollableChat'
import axios from 'axios'
import '../style.css'
import io from 'socket.io-client'
import Lottie from 'react-lottie';
import animationData from '../animations/typing.json'
const ENDPOINT = "http://localhost:4000";
var socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = useContext(ChatContext)
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false) //socket
    const [typing, setTyping] = useState(false);//socket
    const [istyping, setIsTyping] = useState(false);//socket
    const toast = useToast();
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    // console.log(selectedChat)

    const fetchMessages = async () => {
        if (!selectedChat) return
        const config = {
            headers: {
                "Content-type": "application/json",
            },
            withCredentials: true
        };
        setLoading(true)
        const { data } = await axios.get(`http://localhost:4000/api/message/${selectedChat._id}`, config)
        setMessages(data)
        setLoading(false)
        socket.emit('join chat', selectedChat._id)
    }

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit("setup", user)                                  //socket
        socket.on("connected", () => setSocketConnected(true))
        socket.on("typing", () => setIsTyping(true))
        socket.on("stop typing", () => setIsTyping(false))
    }, [])

    useEffect(() => {
        fetchMessages()
        selectedChatCompare = selectedChat //socket
    }, [selectedChat])

    // console.log(notification)

    useEffect(() => {    //socket
        socket.on("message recived", (newMessageRecived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecived.chat._id) {
                if (!notification.includes(newMessageRecived)) {
                    setNotification([newMessageRecived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecived])
            }
        })
    })

    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                    },
                    withCredentials: true
                };
                setNewMessage("")
                const { data } = await axios.post('http://localhost:4000/api/message', {
                    content: newMessage,
                    chatId: selectedChat._id
                },
                    config
                )
                socket.emit("new message", data)            //socket
                setMessages([...messages, data])
                // console.log(data)
            } catch (err) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }
    const typingHandler = (e) => {
        setNewMessage(e.target.value)

        //socket       
        if (!socketConnected) return
        if (!typing) {
            setTyping(true)
            socket.emit('typing', selectedChat._id)
        }
        let lastTypingTime = new Date().getTime()
        var timerLength = 3000
        setTimeout(() => {
            var timeNow = new Date().getTime()
            var timeDiff = timeNow - lastTypingTime
            if (timeDiff >= timerLength && typing) {
                socket.emit('stop typing', selectedChat._id)
                setTyping(false)
            }
        }, timerLength)
    }

    return (
        <>
            {
                selectedChat ? (
                    <>
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            pb={3}
                            px={2}
                            w="100%"
                            fontFamily="Work sans"
                            display="flex"
                            justifyContent={{ base: "space-between" }}
                            alignItems="center"
                        >
                            <IconButton
                                display={{ base: "flex", md: "none" }}
                                icon={<ArrowBackIcon />}
                                onClick={() => setSelectedChat("")}
                            />

                            {
                                !selectedChat.isGroupChat ? (<>
                                    {getSenderAgain(user, selectedChat.users)}
                                    <ProfileModel user={getSenderFull(user, selectedChat.users)} />
                                </>) : (<>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                        fetchMessages={fetchMessages}

                                    />
                                </>)
                            }
                        </Text>
                        <Box
                            display="flex"
                            flexDir="column"
                            justifyContent="flex-end"
                            p={3}
                            bg="#E8E8E8"
                            w="100%"
                            h="100%"
                            borderRadius="lg"
                            overflowY="hidden"
                        >
                            {
                                loading ? (<Spinner
                                    size="xl"
                                    w={20}
                                    h={20}
                                    alignSelf="center"
                                    margin="auto"
                                />) : (
                                    <div className='messages'>
                                        <ScrollableChat messages={messages}></ScrollableChat>
                                    </div>
                                )
                            }
                            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                                {istyping ? <div>
                                    <Lottie
                                        options={defaultOptions}
                                        width={70}
                                        style={{ marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div> : <></>}
                                <Input
                                    variant="filled"
                                    bg="#E0E0E0"
                                    placeholder="Enter a message.."
                                    value={newMessage}
                                    onChange={typingHandler}
                                />
                            </FormControl>
                        </Box>
                    </>
                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )
            }
        </>
    )
}

export default SingleChat