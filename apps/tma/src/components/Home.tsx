import { useEffect, useState,  } from "react";
import { useQuery } from "react-query"
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import { useWebApp } from "@vkruglikov/react-telegram-web-app"
import { WebApp as WebAppVK } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import { useTonConnect } from "../hooks/useTonConnect";
import { buildConnectUrl, buildTransferUrl } from "../utils/urlHelper"
import { deleteBytelegramId, getAddressBytelegramId, getBalanceByAddr, getTxResult } from "../services/api";
import { createPortal } from "react-dom";
import { Modall } from "./modal";
import { mnemonicToWalletKey } from "ton-crypto";
import { formatAddr } from "../utils/utils";


export function Home() {
  const webApp = useWebApp() as WebAppVK;
  const [address, setAddress] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");
  const [connectToken, setConnectToken] = useState("");
  const [transferToken, setTransferToken] = useState("")
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("0.01");
  const [loading, setLoading] = useState<boolean>(false);
  const [authenId, setAuthenId] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);

  const openUrl = (url: string) => {
    try {
      WebApp.openLink(url);
      // webApp?.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    
  }, [])

  const { isLoading, error, data } = useQuery({
    queryKey: ["getAddressBytelegramId"],
    queryFn: () => {
      if(webApp.initDataUnsafe.user?.id) {
        getAddressBytelegramId(webApp.initDataUnsafe.user.id).then((res:any) => {
          if(res.publicKey != "") {
            setAddress(res.contractAddress)
            setPublicKey(res.publicKey)
            setAuthenId(res.authenId)
            updateBalance(res.contractAddress)
          }
        })
      }
    },
  })

  const updateBalance = async (addr: string)=> {
    try {
      const _balance = await getBalanceByAddr(addr)
      setBalance(Number(_balance));
    } catch(e) {}
  }

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
      const { token, url } = buildConnectUrl(webApp.initData, webApp.initDataUnsafe.user?webApp.initDataUnsafe.user.id:0);
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
            setPublicKey(res.publicKey)
            setAuthenId(res.authenId)
            addressVer = res.contractAddress
            updateBalance(res.contractAddress)
            setLoading(false)
          }
        })
        tryCount += 1;
        await sleep(2000);
      }
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }

  const disconnect = () => {
    try {
      setAddress("")
      setPublicKey("")
      setAuthenId("")
      setBalance(0)
      deleteBytelegramId(webApp.initDataUnsafe.user?webApp.initDataUnsafe.user.id:0)
    } catch (error) {
      console.log(error);
    }
  }

  const closeModal = () => {setLoading(false)}
  

  const transfer = async () => {
    try {
      setLoading(true)

      //publicKey+Tx+
      const timeNow = new Date()
      const hashedTxDataLabel = await window.crypto.subtle.digest(
        "SHA-256",
        Buffer.from(recipient+amount+timeNow.toISOString())
      );
      let HashedTxDataLabel = Array.from(new Uint8Array(hashedTxDataLabel)).map(x => x.toString(16)).join('');

      const { token, url } = buildTransferUrl(webApp.initData, recipient, amount, publicKey, HashedTxDataLabel, authenId);
      setTransferToken(token)
      openUrl(url);

      var tryCount = 0;
      var txResult = ""
      while(txResult == "") {
        if(tryCount > 40) {
          showAlert("Connect Time Out!")
          setLoading(false)
          return
        }
        await getTxResult(HashedTxDataLabel).then((res:any) => {
          if(res.result == "success") {
            txResult = "success"
            showAlert("Message Sent!")
            setLoading(false)
          } else if(res.result == "failed") {
            txResult = "failed"
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
          {address != "" ? (
            <div>
              <div className= "madimi-one-regular" style={{ "marginBottom": "10px", "marginTop": "60px","width": "100%", "textAlign": "center", "fontSize": "40px"}}>{Math.floor(Number(balance)/10**5)/10000} Ton</div>
              <div className= "madimi-one-regular" style={{ "marginBottom": "40px", "width": "100%", "textAlign": "center", "color": "gray" }}>{formatAddr(address)}</div>
              <FlexBoxCol>
                <FlexBoxRow className="text-black">
                  <Input placeholder="Recipient" onChange={(e) => { setRecipient(e.currentTarget.value) }}></Input>
                </FlexBoxRow>
                <FlexBoxRow className="text-black	">
                  <Input placeholder="Amount" onChange={(e) => { setAmount(e.currentTarget.value) }}></Input>
                </FlexBoxRow>
                <FlexBoxRow style={{"justifyContent": "center", "width": "100%", "marginTop": "20px"}}>
                  <Button style={{"width": "70%"}} onClick={transfer}>
                    Transfer
                  </Button>
                </FlexBoxRow>
                <FlexBoxRow style={{"justifyContent": "center", "width": "100%", "opacity": "80%"}}>
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
     {loading&&createPortal(<Modall closeModal= {closeModal} message= {"Loading"} />, document.body)}
    </>
  );
}