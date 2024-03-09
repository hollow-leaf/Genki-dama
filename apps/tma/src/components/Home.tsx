import { useState } from "react";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import { useWebApp } from "@vkruglikov/react-telegram-web-app"
import { WebApp as WebAppVK } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import styled from 'styled-components';

export function Home() {
  const webApp = useWebApp() as WebAppVK;

  const [address, setAddress] = useState<string>("Hello");

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
      openUrl("https://d8b0ae80.infspace.pages.dev/");
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
    <Card>
      <FlexBoxCol>
        <Title>Authen Wallet</Title>
        {!address ? (
          <div>
            <h3>Address: </h3>
            <div>{address}</div>
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
  );
}