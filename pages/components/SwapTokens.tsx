import { Button, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import "../../styles/Home.module.css";
import TokenList from './TokenList';

import { AiOutlineDown } from "react-icons/ai";
import { MdSwapVerticalCircle } from "react-icons/md";


//Jupiter Imports
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';


const SwapTokens = ({ tokenList }: any) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [tokenOneAmount, setTokenOneAmount] = useState(0);
    const [tokenTwoAmount, setTokenTwoAmount] = useState(0);

    const [tokenOne, setTokenOne] = useState();
    const [tokenTwo, setTokenTwo] = useState();
    // const [isOpen, setIsOpen] = useState(false);
    const [changeToken, setChangeToken] = useState(1);
    const [prices, setPrices] = useState(null);


    const openTokenModal = () => {
        onOpen();
    }

    const openModal = async (asset: any) => {
        setChangeToken(asset);
        openTokenModal();
    }



    function changeAmount(e: any) {
        setTokenOneAmount(e.target.value);
        if (e.target.value && prices) {
            //   setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
        } else {
            //   setTokenTwoAmount(null);
            setTokenTwoAmount(0);
        }
    }

    // const [tokenList, setTokenList] = useState();

    console.log("Token One 1111", tokenOne);

    console.log("tokenTwo 22222", tokenTwo)


    const [indexRouteMap, setIndexRoutemap] = useState();

    //Jupiter Functions
    const connection = new Connection('https://solana-devnet.g.alchemy.com/v2/QIb7Svucv2br6JObOnHw4GsPriYmdXYY');

    // const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode('3SHjXLKm9QvDPJ3YLXtZcuwSSHEYFdQM7BaB34tS4s2L5XKXpMRYE59h4UJtEaFvX2v6vdaZvxtHrHSgZGn3r5jS' || '')));

    // const getMint = (index: any) => {
    //     if (indexRouteMap) {
    //         indexRouteMap["mintKeys"][index]
    //     }

    // };
    // const getIndex = (mint: any) => {
    //     if (indexRouteMap) {
    //         indexRouteMap["mintKeys"].indexOf(mint)
    //     }
    // };

    // const getRouteOfToken = async () => {
    //     const indexedRouteMap = await (await fetch('https://quote-api.jup.ag/v6/indexed-route-map')).json();
    //     // const getMint = (index) => indexedRouteMap["mintKeys"][index];
    //     // const getIndex = (mint) => indexedRouteMap["mintKeys"].indexOf(mint);
    //     console.log("Get Route Of Token", indexedRouteMap);
    //     setIndexRoutemap(indexedRouteMap);
    // }

    // var generatedRouteMap = {};

    // useEffect(() => {
    //     if (indexRouteMap) {
    //         Object.keys(indexRouteMap['indexedRouteMap']).forEach((key, index) => {
    //             generatedRouteMap[getMint(key)] = indexRouteMap["indexedRouteMap"][key].map((index) => getMint(index))
    //         });
    //         const allInputMints = Object.keys(generatedRouteMap);
    //     }
    // }, [indexRouteMap])


    // List all possible input tokens by mint address
    // const swappableOutputForSOL = generatedRouteMap['So11111111111111111111111111111111111111112'];



    const swapData = async () => {
        const { data } = await (
            await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\
          &outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
          &amount=100000000'
            )
        ).json();
        const quoteResponse = data;

        console.log("Quote response: ", quoteResponse)
    }




    return (
        <div>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent style={{ height: '500px' }}>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody className='overflow-scroll'>
                        <TokenList tokenList={tokenList} changeToken={changeToken} setTokenOne={setTokenOne} setTokenTwo={setTokenTwo} onClose={onClose} />
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='ghost'>Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <InputGroup height='55px' mb='10px'>
                <InputLeftAddon height='100%' onClick={() => openModal(1)} className='cursor-pointer' >
                    <div className='flex items-center text-white rounded-xl bg-slate-500 px-3 py-2'>
                        {tokenOne && tokenOne.symbol}
                        <AiOutlineDown />
                    </div>
                </InputLeftAddon>
                <Input type='number' height='100%' placeholder='0' />
            </InputGroup>

            <div className='flex justify-center'>
                <MdSwapVerticalCircle size='40px' />
            </div>

            <InputGroup height='55px' mt='10px'>
                <InputLeftAddon height='100%' onClick={() => openModal(2)} className='cursor-pointer' >
                    <div className='flex items-center text-white rounded-xl bg-slate-500 px-3 py-2'>
                        {tokenTwo && tokenTwo.symbol}
                        <AiOutlineDown />
                    </div>
                </InputLeftAddon>
                <Input type='number' height='100%' placeholder='0' />
            </InputGroup>


            <div className='my-3'>
                <Button width='100%' colorScheme='blue' mr={3} onClick={swapData}>
                    Swap
                </Button>
            </div>


        </div>
    );
};

export default SwapTokens;