import React, { useState } from 'react';
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
} from '@chakra-ui/react'
import SwapTokens from './SwapTokens';

const TokenModal = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [tokenList, setTokenList] = useState();


    const handleOpenModal = async () => {
        const response = await fetch('https://token.jup.ag/strict');
        const result = await response.json();
        console.log("Response >>>> ", result);
        setTokenList(result);
        onOpen();
    }

    return (
        <>
            <Button onClick={handleOpenModal}>Swap with Jupiter</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Efficiently Swap</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SwapTokens tokenList={tokenList} />
                    </ModalBody>

                </ModalContent>
            </Modal>
        </>
    );
};

export default TokenModal;