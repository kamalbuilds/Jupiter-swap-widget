import React, { useState } from 'react';
import "../../styles/Home.module.css"
import { Input } from '@chakra-ui/react';

const TokenList = ({
    tokenList,
    changeToken,
    tokenOne,
    setTokenOne,
    tokenTwo,
    setTokenTwo,
    onClose }: any) => {

    const [listOfTokens, setListOfTokens] = useState(tokenList);

    const handleChange = (e: any) => {
        const value = e.target.value;
        const sortedTokenList = tokenList.filter((token: any) =>
            token.name.toLowerCase().includes(value.toLowerCase())
        );
        setListOfTokens(sortedTokenList);
    }

    const handleTokenSelect = (token: any) => {
        console.log("Token", token);

        console.log("ChangeTOken", changeToken, tokenOne, tokenTwo);

        if (changeToken == 1) {
            if (token.address == tokenTwo.address) {
                setTokenTwo(tokenOne);
            }
            setTokenOne(token);
        } else {
            if (token.address == tokenOne.address) {
                setTokenOne(tokenTwo);
            }
            setTokenTwo(token);
        }

        onClose();

    }



    return (
        <div className=''>
            <Input placeholder='Search' size='md' onChange={handleChange} />
            {listOfTokens.map((token: any) => {
                return (
                    <div onClick={() => handleTokenSelect(token)} key={token.address} className='flex items-center rounded-2xl p-4 cursor-pointer my-2 hover:bg-slate-400 hover:text-white'>
                        <div className='leftTokenContainer mr-4'>
                            <img src={token.logoURI} className='w-[50px]' />
                        </div>
                        <div className='flex flex-col items-baseline'>
                            <div className=''>{token.name}</div>
                            <div>{token.symbol}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default TokenList;
