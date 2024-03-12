import { useState } from "react";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import { useWebApp } from "@vkruglikov/react-telegram-web-app"
import { WebApp as WebAppVK } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import styled from 'styled-components';
import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonConnect } from "../hooks/useTonConnect";
import { buildConnectUrl, buildTransferUrl } from "../utils/urlHelper"
import { CHAIN } from "@tonconnect/protocol";
import { webAppContext } from "@vkruglikov/react-telegram-web-app/lib/core";

export function Home() {
  const webApp = useWebApp() as WebAppVK;
  const { network } = useTonConnect();
  const [address, setAddress] = useState<string>("");

  const [connectToken, setConnectToken] = useState("");
  const [transferToken, setTransferToken] = useState("")

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("0.01");

  const openUrl = (url: string) => {
    try {
      WebApp.openLink(url);
      // webApp?.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  }

  

  const showAlert = (message: string) => {
    if (!webApp) console.log("webApp is not defined")
    webApp.showAlert && webApp.showAlert(message);
  }



  const connect = () => {
    // if (webApp.initData.length === 0) {
    //   alert("Please open the web app in Telegram");
    //   return;
    // }
    try {
      const { token, url } = buildConnectUrl(webApp.initData);
      // const { token, url } = buildConnectUrl('Test'); // For Web Test
      setConnectToken(token);
      openUrl(url);
      setAddress("Mock Address")
    } catch (error) {
      console.log(error);
    }
  }

  const disconnect = () => {
    try {
      setAddress("")
    } catch (error) {
      console.log(error);
    }
  }
  

  const transfer = () => {
    // if (webApp.initData.length === 0) {
    //   alert("Please open the web app in Telegram");
    //   return;
    // }
    try {
      const { token, url } = buildTransferUrl(webApp.initData, recipient, amount);
      // const { token, url } = buildTransferUrl('Test', recipient, amount); // For Web Test
      setTransferToken(token)
      openUrl(url);
    } catch (error) {
      console.log(error);
    }
  }

  const Title = styled.h1`
    font-size: 1.5em;
    text-align: center;
  `;

  return (
    <>
      <FlexBoxRow>
        <TonConnectButton />
        <Button>
          {network
            ? network === CHAIN.MAINNET
              ? "mainnet"
              : "testnet"
            : "N/A"}
        </Button>
      </FlexBoxRow>
      <Card>
        <FlexBoxCol>
          <Title>User</Title>
          {webApp.initDataUnsafe.user?.id}
          <Title>Authen Wallet</Title>
          {address ? (
            <div>
              <div>Address: </div>
              <div style={{ marginBottom: 10 }}>{address}</div>
              <FlexBoxCol>
                <FlexBoxRow>
                  <Input placeholder="Recipient" onChange={(e) => { setRecipient(e.currentTarget.value) }}></Input>
                </FlexBoxRow>
                <FlexBoxRow>
                  <Input placeholder="Amount" onChange={(e) => { setAmount(e.currentTarget.value) }}></Input>
                </FlexBoxRow>
                <FlexBoxRow>
                  <Button onClick={transfer}>
                    Transfer
                  </Button>
                </FlexBoxRow>
                <FlexBoxRow>
                  <Button onClick={disconnect}>
                    Disconnect
                  </Button>
                </FlexBoxRow>
              </FlexBoxCol>
            </div>
          ) : (
            <div>
              <FlexBoxRow style={{ justifyContent: "center" }}>
                <Button onClick={connect}>
                  connect webauthn
                </Button>
              </FlexBoxRow>
            </div>
          )}
        </FlexBoxCol >
      </Card >
    </>
  );
}