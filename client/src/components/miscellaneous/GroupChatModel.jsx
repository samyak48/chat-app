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
    Box
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatProvider'
import axios from 'axios'
import UserBageItem from '../UserAvtar/UserBageItem'
import UserListItem from '../UserAvtar/UserListItem'
function GroupChatModel({ children }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const { user, chats, setChats } = useContext(ChatContext)

    // console.log(search);
    // console.log(searchResult)
    // console.log(selectedUsers)

    // useEffect(() => {

    //     async function seatchResults() {
    //         setLoading(true)
    //         try {
    //             const config = {
    //                 headers: {
    //                     "Content-type": "application/json",
    //                 },
    //                 withCredentials: true
    //             };
    //             if (search !== "") {
    //                 const { data } = await axios.get(`http://localhost:4000/api/user?search=${search}`, config)
    //                 setLoading(false)
    //                 setSearchResult(data)
    //             }

    //         } catch (err) {
    //             toast({
    //                 title: "Error Occured!",
    //                 description: "Failed to Load the Search Results",
    //                 status: "error",
    //                 duration: 5000,
    //                 isClosable: true,
    //                 position: "bottom-left",
    //             })
    //         }
    //     }
    //     seatchResults()
    // }, [search, toast])


    const handleSearch = async (query) => {
        setSearch(query)
        if (!query) {
            return
        }
        try {
            setLoading(true)
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
                withCredentials: true
            };
            const { data } = await axios.get(`http://localhost:4000/api/user?search=${search}`, config)
            // console.log(data)
            setLoading(false)
            setSearchResult(data)
        } catch (err) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            })
        }
    }


    const handleGroup = (user) => {
        if (selectedUsers.includes(user)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        setSelectedUsers([...selectedUsers, user])
    }

    const handleDelete = (user) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id))
    }


    const handelSubmit = async () => {
        if (!groupChatName) {
            toast({
                title: "Group chat name is required",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        if (selectedUsers.length < 2) {
            toast({
                title: "At least 2 users are required to create a group chat",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        const userIds = selectedUsers.map(user => user._id)
        const groupData = {
            name: groupChatName,
            users: JSON.stringify(userIds)
        }
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
                withCredentials: true
            };
            const { data } = await axios.post('http://localhost:4000/api/chat/group', groupData, config)
            setChats(prevChats => [...prevChats, data])
            onClose();
            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } catch (error) {
            toast({
                title: "Failed to Create the Chat!",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }

    }

    return (
        <>
            <span onClick={onOpen} > {children}</span>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        {/* <Lorem count={2} /> */}
                        <FormControl>
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add Users eg: John, Piyush, Jane"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            // onChange={(e) => setSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box w="100%" display="flex" flexWrap="wrap">

                            {
                                selectedUsers.map((u) => {
                                    return (
                                        <UserBageItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                                    )
                                }
                                )
                            }
                        </Box>
                        {loading ? <div>loading...</div> : (
                            searchResult?.slice(0, 4).map(user => (
                                <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                            )))}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handelSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModel