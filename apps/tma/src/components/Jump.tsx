import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import { useWebApp } from "@vkruglikov/react-telegram-web-app"
import { WebApp as WebAppVK } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
export function Jump() {
  const webApp = useWebApp() as WebAppVK;

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

  return (
    <Card>
      <FlexBoxCol>
        <h3>connect webauthn</h3>
        <FlexBoxRow>
          <Button onClick={connect}>
            connect webauthn
          </Button>
        </FlexBoxRow>
      </FlexBoxCol>
    </Card>
  );
}