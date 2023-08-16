import {  TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID , getAssociatedTokenAddress , createTransferInstruction} from '@solana/spl-token'; // version 0.1.x
import { AddressLookupTableAccount, Connection, Keypair, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import bs58 from 'bs58';
import { Button } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';

const Test = () => {

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const paymentAmount = 1_000; // 0.001 USDC

const merchantWallet = new PublicKey('J34HqUvYCxALnbPrFRXxVXx1T8GSG8yuxf3vdkx7U8Mx');
const reciever = new PublicKey("Fu3MGReA4T5qLH9v2XuJWhK1SdacWzd7E8p6uLZcHcaR");

// signer pvt key 
const signer = anchor.web3.Keypair.fromSecretKey(bs58.decode('' || ''));
const testing = async () => {
    console.log(signer,'sig')
    const { data } = await (
        await fetch('https://quote-api.jup.ag/v4/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=5000'
        )
    ).json();
    
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/SW3uzyu7hPsAhI5878T7jffYghoOuDLk');
    
    const route = data[0];
    console.log("data", data, route);
    
    // get serialized transactions for the swap
    const transactions = await (
      await fetch('https://quote-api.jup.ag/v4/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // route from /quote api
          route: route,
          userPublicKey: reciever,
        })
      })
    ).json();
    
    console.log("made txn")
    
    const { swapTransaction } = transactions;
    console.log(swapTransaction,"swap");

    const userDestinationTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        reciever,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const merchantTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        merchantWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
          // @ts-ignore
        true,
    );

    console.log(userDestinationTokenAccount,merchantTokenAccount);
    
    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    const kamal = transaction
    console.log(transaction);
    
    // get address lookup table accounts
    const addressLookupTableAccounts = await Promise.all(
      transaction.message.addressTableLookups.map(async (lookup) => {
        return new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(await connection.getAccountInfo(lookup.accountKey).then((res) => res.data)),
        });
      })
    );
    console.log(AddressLookupTableAccount)
    
    // decompile transaction message and add transfer instruction
    var message = TransactionMessage.decompile(transaction.message,{addressLookupTableAccounts: addressLookupTableAccounts});
    message.instructions.push(
      createTransferInstruction(
        userDestinationTokenAccount,
        merchantTokenAccount,
        reciever,
        paymentAmount,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );
    
    console.log(message,"msg")
    // compile the message and update the transaction
    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
    
    // ...Send to Alice to sign then send the transaction
    await transaction.sign([signer]);

    // console.log("Signed transaction", signed)

    const rawTransaction = transaction.serialize()
    const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
    });
    await connection.confirmTransaction(txid);
    console.log(`https://solscan.io/tx/${txid}`);
}


return (
    <div>

        <button onClick={testing}>Swap</button>

    </div>
);
};

export default Test;