import { useState } from "react";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import { useWebApp } from "@vkruglikov/react-telegram-web-app"
import { WebApp as WebAppVK } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import styled from 'styled-components';
import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonConnect } from "../hooks/useTonConnect";
import { buildConnectUrl } from "../utils/urlHelper"
import { CHAIN } from "@tonconnect/protocol";

export function Home() {
  const webApp = useWebApp() as WebAppVK;
  const { network } = useTonConnect();
  const [address, setAddress] = useState<string>("{Wallet Address}");
  const [connectToken, setConnectToken] = useState("");

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
    console.log('hello')
    try {
      // const { token, url } = buildConnectUrl(webApp.initData);
      const { token, url } = buildConnectUrl('Test'); // For Web Test
      openUrl(url);
    } catch (error) {
      console.log(error);
    }
  }

  const Title = styled.h1`
    font-size: 1.5em;
    text-align: center;
    color: white;
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
          <Title>Authen Wallet</Title>
          {address ? (
            <div>
              <div>Address: </div>
              <div style={{ marginBottom: 10 }}>{address}</div>
              <FlexBoxCol>
                <FlexBoxRow>
                  <Input placeholder="Recipient"></Input>
                </FlexBoxRow>
                <FlexBoxRow>
                  <Input placeholder="Value"></Input>
                </FlexBoxRow>
                <FlexBoxRow>
                  <Button onClick={() => { }}>
                    Transfer
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