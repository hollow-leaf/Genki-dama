export function formatAddr(addr: string):string {
    if(addr.length < 10) {
        return ""
    }
    const res = addr.substring(0,6) + "..." + addr.substring(addr.length - 6,addr.length)
    return res
}