import React, { useState } from 'react'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatProvider'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    useToast,
    FormControl,
    Input,
    Box,
    IconButton,
    Spinner
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import UserBageItem from '../UserAvtar/UserBageItem'
import axios from 'axios'
import UserListItem from '../UserAvtar/UserListItem'
function UpdateGroupChatModal({ fetchAgain, setFetchAgain, fetchMessages }) {
    const { user, selectedChat, setSelectedChat, setChats } = useContext(ChatContext)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([])

    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();

    // console.log(selectedChat)


    const handleRename = async () => {
        if (!groupChatName) {
            return
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can rename group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        try {
            setRenameLoading(true)
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
                withCredentials: true
            };
            const { data } = await axios.put("http://localhost:4000/api/chat/rename", {
                chatId: selectedChat._id,
                chatName: groupChatName
            },
                config
            )
            setSelectedChat(data)

            setFetchAgain(!fetchAgain)

            // setChats((previousChats) =>
            //     previousChats.map(chat =>
            //         chat._id === data._id ? data : chat     if you dont wnat to user setFetchAgain(!fetchAgain)
            //     )
            // ); 

            setRenameLoading(false)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
    }

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
                withCredentials: true
            };
            const { data } = await axios.get(`http://localhost:4000/api/user?search=${search}`, config);
            // console.log(data);
            setLoading(false);
            setSearchResult(data);

        } catch (err) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setLoading(false);

        }
    }


    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
                withCredentials: true
            };
            const addedUSerData = {
                chatId: selectedChat._id,
                userIds: JSON.stringify([user1._id])
            }
            const { data } = await axios.put("http://localhost:4000/api/chat/groupadd", addedUSerData
                , config)
            // console.log(data.chat)
            setSelectedChat(data.chat)
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }
    const handleRemove = async (user1) => {
        // console.log(user1)
        // console.log(selectedChat.groupAdmin)
        if (user1._id === selectedChat.groupAdmin?._id) {
            toast({
                title: "Click on leave grop to leave the chat",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        if (selectedChat.groupAdmin?._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
                withCredentials: true
            };
            const removedUSerData = {
                chatId: selectedChat._id,
                userIds: JSON.stringify([user1._id])
            }
            // console.log(removedUSerData)
            const { data } = await axios.put("http://localhost:4000/api/chat/groupremove", removedUSerData, config)
            user1._id === user._id ? setSelectedChat() : setSelectedChat(data.populatedChat);
            setFetchAgain(!fetchAgain);
            fetchMessages()
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }

    const handelLeaveChat = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
                withCredentials: true
            };
            const removedUSerData = {
                chatId: selectedChat._id,
            }
            console.log(removedUSerData)
            const { data } = await axios.put("http://localhost:4000/api/chat/leavechat", removedUSerData, config)
            setSelectedChat(data.populatedChat)
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (err) {
            toast({
                title: "Error Occured!",
                description: "Failed to Leave the Chat",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }

    }
    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <Box
                            w="100%" display="flex" flexWrap="wrap" pb={3}
                        >
                            {
                                selectedChat?.users.map((u) => {
                                    return (
                                        <UserBageItem
                                            key={u._id}
                                            user={u}
                                            admin={selectedChat.groupAdmin}
                                            handleFunction={() => handleRemove(u)}
                                        />
                                    )
                                })
                            }
                        </Box>
                        <FormControl display="flex">
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameloading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        {
                            loading ? (
                                <Spinner size="lg" />
                            ) : (
                                searchResult?.map((user) => {
                                    return (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => handleAddUser(user)}
                                        />
                                    )
                                })
                            )
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => handelLeaveChat()} colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal