import { useState,  } from "react";
import { useQuery } from "react-query"
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import { useWebApp } from "@vkruglikov/react-telegram-web-app"
import { WebApp as WebAppVK } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import { useTonConnect } from "../hooks/useTonConnect";
import { buildConnectUrl, buildTransferUrl } from "../utils/urlHelper"
import { deleteBytelegramId, getAddressBytelegramId } from "../services/api";
import { createPortal } from "react-dom";
import { Modal } from "./modal";
import { mnemonicToWalletKey } from "ton-crypto";


export function Home() {
  const webApp = useWebApp() as WebAppVK;
  const { network } = useTonConnect();
  const [address, setAddress] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");
  const [connectToken, setConnectToken] = useState("");
  const [transferToken, setTransferToken] = useState("")
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("0.01");
  const [loading, setLoading] = useState<boolean>(false);

  const openUrl = (url: string) => {
    try {
      WebApp.openLink(url);
      // webApp?.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  }

  const { isLoading, error, data } = useQuery({
    queryKey: ["getAddressBytelegramId"],
    queryFn: () => {
      if(webApp.initDataUnsafe.user?.id) {
        getAddressBytelegramId(webApp.initDataUnsafe.user.id).then((res:any) => {
          if(res.publicKey != "") {
            setAddress(res.contractAddress)
            setPublicKey(res.publicKey)
          }
        })
      }
    },
  })

  const showAlert = (message: string) => {
    if (!webApp) console.log("webApp is not defined")
    webApp.showAlert && webApp.showAlert(message);
  }

  const sleep = (milliseconds: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const connect = async () => {
    setLoading(true)
    try {
      const { token, url } = buildConnectUrl(webApp.initData);
      setConnectToken(token);
      openUrl(url);

      var tryCount = 0;
      var addressVer = ""
      while(addressVer == "") {
        if(tryCount > 40) {
          showAlert("Connect Time Out!")
          setLoading(false)
          return
        }
        await getAddressBytelegramId(webApp.initDataUnsafe.user?webApp.initDataUnsafe.user.id:0).then((res:any) => {
          if(res.publicKey != "") {
            setAddress(res.contractAddress)
            addressVer = res.contractAddress
            setLoading(false)
          }
        })
        tryCount += 1;
        await sleep(3500);
      }
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }

  const disconnect = () => {
    try {
      setAddress("")
      deleteBytelegramId(webApp.initDataUnsafe.user?webApp.initDataUnsafe.user.id:0)
    } catch (error) {
      console.log(error);
    }
  }

  const closeModal = () => {setLoading(false)}
  

  const transfer = async () => {
    try {
      setLoading(true)

      //publicKey+Tx+Timestamp
      const hashedTxDataLabel = await window.crypto.subtle.digest(
        "SHA-256",
        Buffer.from("")
      );

      const { token, url } = buildTransferUrl(webApp.initData, recipient, amount, publicKey);
      setTransferToken(token)
      openUrl(url);

      var tryCount = 0;
      var txHash = ""
      while(txHash == "") {
        if(tryCount > 40) {
          showAlert("Connect Time Out!")
          setLoading(false)
          return
        }
        await getAddressBytelegramId(webApp.initDataUnsafe.user?webApp.initDataUnsafe.user.id:0).then((res:any) => {
          if(res.publicKey != "") {
            setAddress(res.contractAddress)
            txHash = res.contractAddress
            setLoading(false)
          }
        })
        tryCount += 1;
        await sleep(3500);
      }
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  }

  return (
    <>
      <Card>
        <FlexBoxCol>
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
     {loading&&createPortal(<Modal closeModal= {closeModal} message= {"Loading"} />, document.body)}
    </>
  );
}