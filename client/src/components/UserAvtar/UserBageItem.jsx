import React from 'react'
import { Box } from '@chakra-ui/react'
import { CloseIcon } from "@chakra-ui/icons";

function UserBageItem({ user, handleFunction, admin }) {
    // console.log(user)
    return (
        <Box
            px={2}
            py={1}
            borderRadius="lg"
            m={1}
            mb={2}
            variant="solid"
            fontSize={12}
            colorScheme="purple"
            backgroundColor="purple"
            textColor="white"
            cursor="pointer"
            onClick={handleFunction}
        >
            {user.name}
            {admin === user._id && <span> (Admin)</span>}

            <CloseIcon pl={1} />
        </Box>
    )
}

export default UserBageItem