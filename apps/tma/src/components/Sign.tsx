import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import { useWebApp } from "@vkruglikov/react-telegram-web-app"
import { WebApp as WebAppVK } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
export function Sign() {
  const webApp = useWebApp() as WebAppVK;

  return (
    <Card>
      <FlexBoxCol>
        <h3>Sign</h3>
        <FlexBoxRow>
        </FlexBoxRow>
      </FlexBoxCol>
    </Card>
  );
}