import { useEffect, useState } from "react";
import { useWakuContext } from "../hooks/useWaku";
import { bytesToUtf8, createDecoder, createEncoder, IMessage, utf8ToBytes } from "@waku/sdk";


const Waku = () => {
    const {node, connected, start, health} = useWakuContext()
    const [peers, setPeers] = useState<string[]>([])

    const [text, setText] = useState<string>()
    const [historicalMessages, setHistoricalMessages] = useState<string[]>([])

    
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

    const query = async () => {
        if (!node || !connected || !node.store) return

        const decoder = createDecoder("/example/1/foo/plain", {clusterId: 42, shard: 0})


        for await (const messagesPromises of node.store.queryGenerator(
            [decoder],
            //options
        )) {
            await Promise.all(
                messagesPromises
                    .map(async (p) => {
                        const msg = await p;
                        if (msg)
                            console.log(bytesToUtf8(msg.payload))
                            setHistoricalMessages((msgs) => [...msgs, bytesToUtf8(msg!.payload)])

                    })
            );
        }

    }
    return (
        <div>
            <div>Peers: {peers}</div>
            <div>Health: {health}</div>
            <div><input type="text" onChange={(e) => setText(e.target.value)}/></div>
            <div><button onClick={publish}>Send</button></div>
            <div><button onClick={query}>Query Store</button></div>
            <div>{historicalMessages.map((msg) => <div>{msg}</div>)}</div>
        </div>
    )
}

export default Waku;