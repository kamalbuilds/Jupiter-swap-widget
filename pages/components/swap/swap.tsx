import React, { useEffect, useState } from 'react';
import { Connection, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
// import { Wallet } from '@project-serum/anchor';
// const { wallet } = require("@project-serum/anchor");
import * as anchor from '@project-serum/anchor';


import bs58 from 'bs58';
import { Button } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';

const Swap = () => {

    // const [indexedRouteMap,setIndexedRouteMap] = useState();

    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/SW3uzyu7hPsAhI5878T7jffYghoOuDLk');

    // const walletS = new wallet(Keypair.fromSecretKey(bs58.decode('3SHjXLKm9QvDPJ3YLXtZcuwSSHEYFdQM7BaB34tS4s2L5XKXpMRYE59h4UJtEaFvX2v6vdaZvxtHrHSgZGn3r5jS' || '')));


    const walletS = anchor.web3.Keypair.fromSecretKey(bs58.decode('3SHjXLKm9QvDPJ3YLXtZcuwSSHEYFdQM7BaB34tS4s2L5XKXpMRYE59h4UJtEaFvX2v6vdaZvxtHrHSgZGn3r5jS' || '')).publicKey;


    const signer = anchor.web3.Keypair.fromSecretKey(bs58.decode('3SHjXLKm9QvDPJ3YLXtZcuwSSHEYFdQM7BaB34tS4s2L5XKXpMRYE59h4UJtEaFvX2v6vdaZvxtHrHSgZGn3r5jS' || ''))

    console.log("wallets", walletS, signer)

    // const getMint = (param: any) => {
    //     console.log("Index getMint", param)
    //     return param.indexedRouteMap["mintKeys"][param.index];
    // };
    const getIndex = (indexedRouteMap: any, mint: any) => {
        return indexedRouteMap["mintKeys"].indexOf(mint);

    };


    const getMint = (indexedRouteMap: any, index: any) => {
        return indexedRouteMap["mintKeys"][index];
    };


    const wallet = useWallet();
    console.log("Wallet", wallet);




    const transaction = async () => {
        // const indexedRouteMap = await (await fetch('https://quote-api.jup.ag/v6/indexed-route-map')).json();

        // console.log("indexedRouteMap", indexedRouteMap)

        // var generatedRouteMap = {};
        // Object.keys(indexedRouteMap['indexedRouteMap']).forEach((key, index) => {
        //     generatedRouteMap[getMint(indexedRouteMap, key)] = indexedRouteMap["indexedRouteMap"][key].map((index) => getMint(indexedRouteMap, index))
        // });


        // console.log("Generated Txn", generatedRouteMap, indexedRouteMap);

        // const allInputMints = Object.keys(generatedRouteMap);

        // const swappableOutputForSOL = generatedRouteMap['So11111111111111111111111111111111111111112'];

        const { data } = await (
            await fetch('https://quote-api.jup.ag/v4/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=5000'
            )
        ).json();


        const route = data[0];
        console.log("data", data, route);

        const alltransactions = await (
            await fetch('https://quote-api.jup.ag/v4/swap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // route from /quote api
                    route: data[0],
                    userPublicKey: walletS.toBase58(),
                })
            })
        ).json();

        const { swapTransaction,
            setupTransaction,
            cleanupTransaction, } = alltransactions;

        console.log("Swap transactions", swapTransaction, alltransactions);

        // const transactions = (
        //     [
        //         setupTransaction,
        //         swapTransaction,
        //         cleanupTransaction,
        //     ].filter(Boolean) as string[]
        // ).map((tx) => {

        //     const transactionBug = Buffer.from(tx, 'base64');
        //     var transaction = VersionedTransaction.deserialize(transactionBug);

        //     return transaction;
        // });

        const transactionBuf = Buffer.from(swapTransaction, 'base64');

        var transaction = VersionedTransaction.deserialize(transactionBuf);

        console.log(transaction, "sign txn start");

        const signed = transaction.sign([signer]);

        console.log("Signed transaction", signed); 

        const rawTransaction = transaction.serialize()
        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2
        });
        await connection.confirmTransaction(txid);
        console.log(`https://solscan.io/tx/${txid}`);




        // for (let transaction of transactions) {
        //     // get transaction object from serialized transaction

        //     console.log(transaction, "txn now :")
        //     // perform the swap
        //     const txid = await connection.sendRawTransaction(
        //         transaction.serialize()
        //     );

        //     await connection.confirmTransaction(txid);
        //     console.log(`https://solscan.io/tx/${txid}`);
        // }




    }


    return (
        <div>

            <Button onClick={transaction}>Swap</Button>

        </div>
    );
};

export default Swap;