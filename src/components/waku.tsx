import { useEffect, useState } from "react";
import { useWakuContext } from "../hooks/useWaku";
import { createEncoder, IMessage, utf8ToBytes } from "@waku/sdk";


const Waku = () => {
    const {node, connected, start, health} = useWakuContext()
    const [peers, setPeers] = useState<string[]>([])

    const [text, setText] = useState<string>()

    
    useEffect(() => {
        if (!start || connected) return
        start()
    }, [start, connected])

    useEffect(() => {
        if (!node) return

        node.getConnectedPeers().then((peers) => {
            setPeers(peers.map((p) => p.addresses[0].multiaddr.toString()))
        })
    }, [node, connected])

    const publish = async () => {
        if (!node || !connected || !text) return

        const encoder = createEncoder({contentTopic: "/example/1/foo/plain", pubsubTopicShardInfo: {clusterId: 42, shard: 0}})
        const message:IMessage = {payload: utf8ToBytes(text)}

        console.log(await node.lightPush?.send(encoder, message))
    }
    return (
        <div>
            <div>Peers: {peers}</div>
            <div>Health: {health}</div>
            <div><input type="text" onChange={(e) => setText(e.target.value)}/></div>
            <div><button onClick={publish}>Send</button></div>
        </div>
    )
}

export default Waku;