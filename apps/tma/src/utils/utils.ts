export function formatAddr(addr: string):string {
    if(addr.length < 10) {
        return ""
    }
    const res = addr.substring(0,5) + "..." + addr.substring(addr.length - 4,addr.length)
    return res
}