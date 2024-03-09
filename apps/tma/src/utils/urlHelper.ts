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

export const buildConnectUrl = (initData: string) => {
    const token = generateToken(initData, Action.Connect);
    const encodedData = encodeURIComponent(`?miniAppURL=${encodeURIComponent(window.location.href)}&miniAppToken=${encodeURIComponent(token)}&callbackUrl=${encodeURIComponent(window.location.href)}`);
    const url = `${window.location.href}login?_data_=${encodedData}`

    return { token, url }
};
