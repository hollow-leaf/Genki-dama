import { Keccak } from 'sha3';

export enum Action {
    Connect,
    Transfer,
}

const Colon = '%3A'
const Comma = '%2C'

export const generateToken = (initData: string, action: Action) => {
    if (initData.length === 0) {
        throw new Error("Telegram webApp initData cannot be empty");
    }
    const data = decodeURI(initData)
    const userId = data.substring(data.indexOf(Colon) + Colon.length, data.indexOf(Comma));
    const hash = new Keccak(256);
    hash.update(`${Number(userId).toString(16)}`);
    const hashId = hash.digest('hex')
    const rand = [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    switch (action) {
        case Action.Connect:
            return `conn${hashId}${rand}`
        default:
            return `transfer${hashId}${rand}`;
    }
}

// Note: Don't use for demo
const miniApp = 'tonauthn_bot'

export const buildConnectUrl = (initData: string) => {
    const token = generateToken(initData, Action.Connect);
    const encodedData = encodeURIComponent(`?miniAppURL=${encodeURIComponent(`https://t.me/${miniApp}`)}&miniAppToken=${encodeURIComponent(token)}&callbackUrl=${encodeURIComponent(window.location.href)}`);
    const url = `${window.location.href.replace(/#.*$/, '')}login?_data_=${encodedData}`
    return { token, url }
};

export const buildTransferUrl = (initData: string, recipient: string, amount: string) => {
    const token = generateToken(initData, Action.Transfer);
    const encodedData = encodeURIComponent(`?miniAppURL=${encodeURIComponent(`https://t.me/${miniApp}`)}&miniAppToken=${encodeURIComponent(token)}&recipient=${encodeURIComponent(recipient)}&amount=${encodeURIComponent(amount)}&callbackUrl=${encodeURIComponent(window.location.href)}`);
    const url = `${window.location.href.replace(/#.*$/, '')}transfer?_data_=${encodedData}`
    return { token, url }
};
