import type { NextPage } from "next";
import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";
import { useWallet } from "@solana/wallet-adapter-react";
import TokenModal from "./components/TokenModal";
import Payments from "./components/Payments/Payments";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Home: NextPage = () => {

  const wallet = useWallet();

  return (
    <>
      <div className={styles.container}>

        <h1 className={styles.h1}>Best Price, Best UX, Best Tokens and have Access to all liquidity on Solana🪙</h1>
        
        <div>
          <TokenModal />
        </div>

      </div>
    </>
  );
};

export default Home;
