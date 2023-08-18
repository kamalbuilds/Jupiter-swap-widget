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
import * as anchor from '@project-serum/anchor';



const SwapTokens = ({ tokenList }: any) => {

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [tokenOneAmount, setTokenOneAmount] = useState(0);
    const [tokenTwoAmount, setTokenTwoAmount] = useState(0);

    const [tokenOne, setTokenOne] = useState(tokenList[0]);
    const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
    const [changeToken, setChangeToken] = useState(1);

    const openTokenModal = () => {
        onOpen();
    }

    const openModal = async (asset: any) => {
        setChangeToken(asset);
        openTokenModal();
    }


    const changeTokenOneAmount = (e: any) => {
        setTokenOneAmount(e.target.value);
        fetchTokenPrice(e.target.value);
    }

    useEffect(() => {
        if (tokenOneAmount) {
            fetchTokenPrice(tokenOneAmount)
        }
    }, [tokenOne, tokenTwo])

    const fetchTokenPrice = async (amount: number) => {

        const decimalValue = Math.pow(10, tokenOne.decimals);
        console.log(decimalValue, tokenOne.decimals)
        const fixAmount = amount * decimalValue;

        console.log("fixAmount", fixAmount, decimalValue);

        const tokenURL = `https://quote-api.jup.ag/v4/quote?inputMint=${tokenOne.address}&outputMint=${tokenTwo.address}&amount=${fixAmount}`;
        const res = await fetch(tokenURL);
        const response = await res.json();
        console.log("Response", response)

        const { data } = response;

        const outputTokenPrice = data[0].outAmount;
        const decimalOutputTokenValue = Math.pow(10, tokenTwo.decimals);
        const totalOutputTokenValue = outputTokenPrice / decimalOutputTokenValue;
        setTokenTwoAmount(totalOutputTokenValue);
    }


    console.log("Token One 1111", tokenOne);

    console.log("tokenTwo 22222", tokenTwo)


    const [indexRouteMap, setIndexRoutemap] = useState();

    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/SW3uzyu7hPsAhI5878T7jffYghoOuDLk');

    const swapTokensOneAndTwo = () => {
        setTokenOne(tokenTwo);
        setTokenTwo(tokenOne);
    }

    const wallets = anchor.web3.Keypair.fromSecretKey(bs58.decode('' || '')).publicKey;

    const signer = anchor.web3.Keypair.fromSecretKey(bs58.decode('' || ''))

    console.log("Signer", signer, wallets);

    const swapTokensData = async () => {
        if (tokenOneAmount) {
            const decimalValue = Math.pow(10, tokenOne.decimals);
            console.log(decimalValue, tokenOne.decimals)
            const fixAmount = tokenOneAmount * decimalValue;

            //fetching data of the tokens
            const tokenURL = `https://quote-api.jup.ag/v4/quote?inputMint=${tokenOne.address}&outputMint=${tokenTwo.address}&amount=${fixAmount}`;
            const res = await fetch(tokenURL);
            const response = await res.json();

            const { data } = response;

            console.log("Response", response, data);

            //swapping tokens
            const alltransactions = await (
                await fetch('https://quote-api.jup.ag/v4/swap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        // route from /quote api
                        route: data[0],
                        userPublicKey: wallets.toBase58(),
                    })
                })
            ).json();
            const {
                swapTransaction,
                setupTransaction,
                cleanupTransaction,
            } = alltransactions;

            console.log("Swap transactions", swapTransaction, alltransactions);

            const transactionBuf = Buffer.from(swapTransaction, 'base64');
            var transaction = VersionedTransaction.deserialize(transactionBuf);

            console.log(transaction, "sign txn start");

            const signed = transaction.sign([signer]);

            console.log("Signed transaction", signed)

            const rawTransaction = transaction.serialize()
            const txid = await connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
                maxRetries: 2
            });
            await connection.confirmTransaction(txid);
            console.log(`https://solscan.io/tx/${txid}`);

        }




    }

    return (
        <div>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent style={{ height: '500px' }}>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody className='overflow-scroll'>
                        <TokenList
                            tokenList={tokenList}
                            changeToken={changeToken}
                            tokenOne={tokenOne}
                            setTokenOne={setTokenOne}
                            tokenTwo={tokenTwo}
                            setTokenTwo={setTokenTwo}
                            onClose={onClose} />
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
                <Input type='number' height='100%' placeholder='0' onChange={(e) => changeTokenOneAmount(e)} />
            </InputGroup>

            <div className='flex justify-center'>
                <MdSwapVerticalCircle size='40px' onClick={swapTokensOneAndTwo} />
            </div>

            <InputGroup height='55px' mt='10px'>
                <InputLeftAddon height='100%' onClick={() => openModal(2)} className='cursor-pointer' >
                    <div className='flex items-center text-white rounded-xl bg-slate-500 px-3 py-2'>
                        {tokenTwo && tokenTwo.symbol}
                        <AiOutlineDown />
                    </div>
                </InputLeftAddon>
                <Input
                    value={tokenTwoAmount}
                    disabled={true} type='number' height='100%' placeholder='0' />
            </InputGroup>


            <div className='my-3'>
                <Button
                    width='100%'
                    colorScheme='blue'
                    mr={3}
                    onClick={swapTokensData}>
                    Swap
                </Button>
            </div>


        </div>
    );
};

export default SwapTokens;