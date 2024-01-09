import os from "os"

export default function getIP() {
    const networkInterfaces = os.networkInterfaces()
    const source = networkInterfaces["Wi-Fi"]
    if(source) {
        return source.at(-1)["address"]
    }
    return "localhost"
}