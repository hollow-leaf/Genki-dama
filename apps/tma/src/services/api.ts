import  { Network, Tonfura } from "tonfura-sdk";

//Tonfura api call
const  TONFURA_KEY  = "179dee90-80aa-494c-ad5a-c427bac8d475";
const tonfura = new Tonfura({
    apiKey: TONFURA_KEY,
    network: Network.Mainnet,
});

export async function getBalanceByAddr(addr: string) {
    try {
        const addressBalance = await tonfura.core.getAddressBalance(addr);
        console.log(addressBalance)
        return addressBalance.data.result
    } catch(e) {
        console.log(e)
        return 0
    }
}

//serverless call
const  headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

const HOST = "https://authenwallet.wayneies1206.workers.dev"

export async function getAddressBytelegramId(telegramId:number) {
    try {
        let body = {
            "telegramId": telegramId
        }
        const res = await fetch(HOST + '/userInfo', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            const rres = await res.json()
            return {publicKey: rres.publicKey, contractAddress: rres.contractAddress, authenId: rres.authenId}
        }else{
            return {publicKey: "", contractAddress: "", authenId: ""}
        }
    }
    catch (err) {
        console.log("error", err);
        return {publicKey: "", contractAddress: "", authenId: ""}
    }
}

export async function deleteBytelegramId(telegramId:number) {
    try {
        let body = {
            "telegramId": telegramId,
        }
        const res = await fetch(HOST + '/cleanUserInfo', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
    }
    catch (err) {
        console.log("error", err);
    }
}

export async function updateAddressBytelegramId(telegramId:string, publicKey:string, contractAddress:string,  authenId:string) {
    try {
        let body = {
            "telegramId": telegramId,
            "publicKey": publicKey,
            "contractAddress": contractAddress,
            "authenId": authenId
        }
        const res = await fetch(HOST + '/updateUserInfo', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            const rres = await res
            return true
        }else{
            return false
        }
    }
    catch (err) {
        console.log("error", err);
        return false
    }
}

export async function getTxResult(hashedTxDataLabel: string) {
    try {
        let body = {
            "hashedTxDataLabel": hashedTxDataLabel
        }
        const res = await fetch(HOST + '/txResult', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            const rres = await res.json()
            return {result: rres.result}
        }else{
            return {result: "failed"}
        }
    }
    catch (err) {
        console.log("error", err);
        return {result: "failed"}
    }
}

export async function updateTxResult(hashedTxDataLabel: string) {
    try {
        let body = {
            "hashedTxDataLabel": hashedTxDataLabel,
            "result" : "success"
        }
        const res = await fetch(HOST + '/updateTxResult', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
    }
    catch (err) {
        console.log("error", err);
    }
}