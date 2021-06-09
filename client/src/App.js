import React, { useCallback, useEffect, useState } from 'react';
import { StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useUserAddress } from 'eth-hooks';
import { useUserProvider, useContractLoader, useBalance } from './hooks';
import { NETWORKS } from './networks';
import { generateSignature } from './lib/SignerConnect';
import { Text, Page, Tabs, Row, Col, Spacer } from '@geist-ui/react';

import ContractsNotDeployed from './components/ContractsNotDeployed/ContractsNotDeployed';
import ConnectWeb3Modal from './components/ConnectWeb3Modal/ConnectWeb3Modal';
import MyAccount from './components/MyAccount/MyAccount';

const targetNetwork = NETWORKS['localhost'];
const localProviderUrl = targetNetwork.rpcUrl;
const localProvider = new StaticJsonRpcProvider(localProviderUrl);

function App() {
  const [hash, setHash] = useState();
  const [signedText, setSignedText] = useState();

  const [injectedProvider, setInjectedProvider] = useState();

  const userProvider = useUserProvider(injectedProvider);
  const address = useUserAddress(userProvider);
  const balance = useBalance(userProvider, address);
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  const writeContracts = useContractLoader(userProvider);

  const loadWeb3Modal = useCallback(() => {
    async function setProvider() {
      const provider = await web3Modal.connect();

      const web3Provider = new Web3Provider(provider);

      const result = await generateSignature(web3Provider);
      setHash(result.hash);
      setSignedText(result.signedText);

      setInjectedProvider(web3Provider);
    }
    setProvider();
  }, [setInjectedProvider]);

  useEffect(() => {
    function init() {
      if (web3Modal.cachedProvider) {
        loadWeb3Modal();
      }
    }
    init();
  }, [loadWeb3Modal]);

  return (
    <Page size='large'>
      <Row align='middle'>
        <Col span={20}>
          <Page.Header>
            <Text style={{ fontFamily: 'sans-serif' }} h2>
              Signature Verification Gas Cost 💸
            </Text>
          </Page.Header>
        </Col>
        <Col span={4}>
          <ConnectWeb3Modal web3Modal={web3Modal} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        </Col>
      </Row>
      {injectedProvider === undefined ? (
        <Text></Text>
      ) : localChainId && selectedChainId && localChainId != selectedChainId ? (
        <ContractsNotDeployed localChainId={localChainId} selectedChainId={selectedChainId} />
      ) : (
        <>
          <Spacer y={1} />
          <Tabs initialValue='1'>
            <Spacer y={1} />
            <Tabs.Item label='account' value='1'>
              <MyAccount address={address} balance={balance} writeContracts={writeContracts} hash={hash} signedText={signedText} />
            </Tabs.Item>
          </Tabs>
        </>
      )}
    </Page>
  );
}

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.REACT_APP_INFURA_API_KEY,
      },
    },
  },
  theme: 'dark',
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on('chainChanged', (chainId) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

window.ethereum &&
  window.ethereum.on('accountsChanged', (accounts) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

export default App;
