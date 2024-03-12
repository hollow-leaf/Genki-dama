const  headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

//serverless call
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
            return {publicKey: rres.publicKey, contractAddress: rres.contractAddress}
        }else{
            return {publicKey: "", contractAddress: ""}
        }
    }
    catch (err) {
        console.log("error", err);
        return {publicKey: "", contractAddress: ""}
    }
}

export async function deleteBytelegramId(telegramId:number) {
    try {
        let body = {
            "telegramId": telegramId
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