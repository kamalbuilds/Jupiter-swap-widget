import { Button, Input } from '@chakra-ui/react';
import React, { useState } from 'react';

import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AddressLookupTableAccount, Connection, Keypair, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { useWallet } from '@solana/wallet-adapter-react';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';

const Payments = () => {

    const [tokenOne, setTokenOne] = useState(
        {
            "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "chainId": 101,
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
            "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
            "tags": [
                "old-registry"
            ],
            "extensions": {
                "coingeckoId": "usd-coin"
            }
        });
    const [tokenTwo, setTokenTwo] = useState(
        {
            "address": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            "chainId": 101,
            "decimals": 9,
            "name": "Marinade staked SOL (mSOL)",
            "symbol": "mSOL",
            "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
            "tags": [
                "old-registry",
                "solana-fm"
            ],
            "extensions": {
                "coingeckoId": "msol"
            }
        });

    const [amount, setAmount] = useState(0);

    const handleChange = (value: any) => {
        setAmount(value);
    }

    const wallet = useWallet();

    const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const paymentAmount = 5_000_000; // 5 USDC
    const merchantWallet = new PublicKey('36JMez4kGR83fxpTaRqejMBN45Jiw7tuRnCiMerBDrLm');

    const transact = async () => {
        const routes = await fetch('https://quote-api.jup.ag/v4/quote?inputMint=mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=5');
        const { data } = await routes.json();
        console.log("Routes", data);

        const walletPublicKey = new PublicKey('BdmTErh4V4Y8R6VL5ZtXCsnDQJgKznwKxCRVH1mpUXun');

        console.log("Wallet key", walletPublicKey.toString());

        const transactionData = await fetch('https://quote-api.jup.ag/v4/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // route from /quote api
                route: data[0],
                userPublicKey: walletPublicKey.toString(),
            })
        })
        const response = await transactionData.json();
        console.log("Response", response);

        const { swapTransaction } = response;

        const TOKEN_2022_PROGRAM_ID = new PublicKey(
            'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
        );

        // const userDestinationTokenAccount = Token.getAssociatedTokenAddress(
        //     ASSOCIATED_TOKEN_PROGRAM_ID,
        //     TOKEN_PROGRAM_ID,
        //     USDC_MINT,
        //     wallet.publicKey,
        // );
        // const merchantTokenAccount = Token.getAssociatedTokenAddress(
        //     ASSOCIATED_TOKEN_PROGRAM_ID,
        //     TOKEN_PROGRAM_ID,
        //     USDC_MINT,
        //     merchantWallet,
        //     // @ts-ignore
        //     true,
        // );

        const connection = new Connection('https://solana-devnet.g.alchemy.com/v2/QIb7Svucv2br6JObOnHw4GsPriYmdXYY');
        const pbKye = new PublicKey('BdmTErh4V4Y8R6VL5ZtXCsnDQJgKznwKxCRVH1mpUXun'); // insert your key

        await connection.getAccountInfo(pbKye).then((res) => {
            console.log("res", res);
        })


        const userDestinationTokenAccount = await await connection.getTokenAccountsByOwner(
            merchantWallet, { programId: TOKEN_2022_PROGRAM_ID }
        );


        const merchantTokenAccount = await connection.getTokenAccountsByOwner(
            walletPublicKey, { programId: TOKEN_2022_PROGRAM_ID }
        );


        //getting the transaction data
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        console.log("transaction", transaction);

        // const rawTransaction = transaction.serialize()
        // const txid = await connection.sendRawTransaction(rawTransaction, {
        //     skipPreflight: true,
        //     maxRetries: 2
        // });
        // await connection.getTransaction(txid);
        // console.log(`https://solscan.io/tx/${txid}`);


        // const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode('3SHjXLKm9QvDPJ3YLXtZcuwSSHEYFdQM7BaB34tS4s2L5XKXpMRYE59h4UJtEaFvX2v6vdaZvxtHrHSgZGn3r5jS' || '')));

        // const base = Keypair.generate();
        // const signTxn = transaction.sign([wallet.payer, base]);

        // console.log("signTxn", signTxn);


        // get address lookup table accounts
        const addressLookupTableAccounts = await Promise.all(
            transaction.message.addressTableLookups.map(async (lookup) => {
                return new AddressLookupTableAccount({
                    key: lookup.accountKey,
                    state: AddressLookupTableAccount.deserialize(await connection.getAccountInfo(lookup.accountKey).then((res) => {
                        console.log("Res", res);
                        return res.data;
                        // return res.data;
                    })),
                });
            })
        );
        console.log("addressLookupTableAccounts >>> ", addressLookupTableAccounts)


        // decompile transaction message and add transfer instruction
        var message = TransactionMessage.decompile(transaction.message, { addressLookupTableAccounts: addressLookupTableAccounts });
        message.instructions.push(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                userDestinationTokenAccount,
                merchantTokenAccount,
                wallet.publicKey,
                [],
                paymentAmount,
            ),
        );

        transaction.message = message.compileToV0Message(addressLookupTableAccounts);


    }



    return (
        <div>

            <Input placeholder='Amount' onChange={(e) => handleChange(e.target.value)} />

            <div>
                <div>Name: {tokenOne.symbol}</div>
                <div>Address: {tokenOne.address}</div>
                <div></div>
            </div>

            <div>
                <div>Name: {tokenTwo.symbol}</div>
                <div>Address: {tokenTwo.address}</div>
                <div></div>
            </div>

            <Button onClick={transact}>Swap</Button>


        </div>
    );
};

export default Payments;
