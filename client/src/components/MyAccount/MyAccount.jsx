import React, { useEffect, useState } from 'react';
import { utils } from 'ethers';
import { Text, Divider, Spacer, Snippet, Button, useToasts } from '@geist-ui/react';
import { isBytes } from '@ethersproject/bytes';

function MyAccount({ address, balance, writeContracts, hash, signedText }) {
  const [loading, setLoading] = useState(false);
  const [toasts, setToast] = useToasts();

  const showAlert = (alertMessage, alertColor) => {
    setLoading(false);
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  useEffect(() => {
    async function init() {
      try {
      } catch (e) {
        console.log(e);
      }
    }
    init();
  }, [writeContracts]);

  const onVerify = async () => {
    try {
      const tx = await writeContracts.SigningModule.getSigner(hash, signedText);
      console.log(tx);
      //   const txReceipt = await tx.wait();
      //   if (txReceipt.status === 1) {
      //     showAlert('Transaction successful!', 'success');
      //   } else if (txReceipt.status === 0) {
      //     showAlert('Transaction rejected!', 'warning');
      //   }
    } catch (e) {
      if (e.data !== undefined) {
        const error = e.data.message.split(':')[2].split('revert ')[1];
        showAlert(error + '!', 'warning');
      } else {
        console.log(e);
        showAlert('Error!', 'warning');
      }
    }
  };

  return (
    <>
      <Text b>Account address :</Text>
      <Spacer />
      <Snippet text={address} type='lite' filled symbol='' width='390px' />
      <Divider />
      <Text b>Account balance :</Text>
      <Text>
        {balance !== undefined ? utils.formatEther(balance) : ''}
        <Spacer inline x={0.35} />
        ETH
      </Text>
      <Divider />
      <Text b>Signed message hash :</Text>
      <Text>{hash}</Text>
      <Divider />
      <Text b>Signed text :</Text>
      <Text>{signedText}</Text>
      <Divider />
      <Spacer />
      {!loading ? (
        <Button type='secondary' auto onClick={onVerify}>
          Verify
        </Button>
      ) : (
        <Button type='secondary' auto loading>
          Verify
        </Button>
      )}
      <Divider />
      <Text b>Verified address :</Text>
      <Text></Text>
      <Divider />
      <Text b>Gas cost :</Text>
      <Text></Text>
    </>
  );
}

export default MyAccount;
