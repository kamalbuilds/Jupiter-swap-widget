// @ts-nocheck
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token'; // version 0.1.x
import { AddressLookupTableAccount, Connection, Keypair, MessageV0, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import bs58 from 'bs58';
import { Button } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';

const Payments = () => {
  const wallet = useWallet();
  console.log("Wallet", wallet);
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const paymentAmount = 1_000; // 0.001 USDC

  /**
   * Bob is Seller and Alice is buyer
   * Alice has mSol and he wants to pay in USDC
   * Alice will swap USDC to mSol.
   * 
   * Swap will be done by the buyer not seller.
   * 
   * userDestinationTokenAccount -> the associated token account of the user who is paying i.e, Alice.
   * merchantTokenAccount -> the associated token account of the user to whom the amount is paid.
   * 
   */

  const senderWallet = new PublicKey('J34HqUvYCxALnbPrFRXxVXx1T8GSG8yuxf3vdkx7U8Mx');

  const recieverWallet = new PublicKey("Fu3MGReA4T5qLH9v2XuJWhK1SdacWzd7E8p6uLZcHcaR");

  // signer pvt key 
  const signer = anchor.web3.Keypair.fromSecretKey(bs58.decode('' || ''));

  const testing = async () => {
    // console.log(signer, 'sig')
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
          userPublicKey: senderWallet, //here publicKey of the sender who is sending the transaction
          computeUnitPriceMicroLamports: 1
        })
      })
    ).json();

    console.log("made txn")

    const { swapTransaction } = transactions;
    console.log(swapTransaction, "swap");

    /**
     * userDestinationTokenAccount -> the associated token account of the user who is paying i.e, Alice.
     * merchantTokenAccount -> the associated token account of the user to whom the amount is paid.
    */


    const userDestinationTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      senderWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const merchantTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      recieverWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
      // @ts-ignore
      true,
    );

    console.log(userDestinationTokenAccount, merchantTokenAccount);

    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // get address lookup table accounts
    const addressLookupTableAccounts = await Promise.all(
      transaction.message.addressTableLookups.map(async (lookup) => {
        return new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(await connection.getAccountInfo(lookup.accountKey)
            .then((res) => res.data)),
        });
      })
    );
    console.log(AddressLookupTableAccount)

    // decompile transaction message and add transfer instruction
    var message = TransactionMessage.decompile(transaction.message, { addressLookupTableAccounts: addressLookupTableAccounts });
    message.instructions.push(
      createTransferInstruction(
        userDestinationTokenAccount,
        merchantTokenAccount,
        recieverWallet,
        paymentAmount,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    console.log(message, "msg")

    // compile the message and update the transaction
    const messagev0 = message.compileToV0Message(addressLookupTableAccounts);
    const newtransaction = new web3.VersionedTransaction(messagev0);
    // ...Send to Alice to sign then send the transaction
    // const sign= await wallet.signTransaction(transaction);

    const signedtxn = await newtransaction.sign([signer]);

    console.log("Signed transaction", signedtxn)

    // const txi = await connection.sendTransaction(newtransaction , {
    //   skipPreflight: true,
    //   maxRetries: 2
    // });
    // await connection.confirmTransaction(txid);
    // console.log(`https://solscan.io/tx/${txid}`);
  }


  return (
    <div>
      {wallet.connected ? <p>Connected</p> : <p>Not Connected</p>}
      <Button onClick={testing}>Pay to Merchant</Button>

    </div>
  );
};

export default Payments;
