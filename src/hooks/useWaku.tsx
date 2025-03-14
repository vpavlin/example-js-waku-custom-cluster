import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    createLightNode,
    waitForRemotePeer,
    createDecoder,
    LightNode,
    EConnectionStateEvents,
  } from "@waku/sdk";
import {
    HealthStatus,
    HealthStatusChangeEvents,
    IWaku,
    Protocols
} from "@waku/interfaces"
import { BOOTSTRAP_NODES } from "../cosntants";

export type WakuInfo = {
    node: IWaku | undefined;
    status: string;
    connected: boolean;
    health: HealthStatus
    start: () => void;
    stop: () => void;
}

export type WakuContextData = {
    providerInfo: WakuInfo;
} | null;

export const WakuContext = React.createContext<WakuContextData>(null);

export const useWakuContext = () => {
    const wakuContext = useContext(WakuContext);

    if (!wakuContext) {
        throw new Error("WakuContext at a wrong level")
    }
    const { providerInfo } = wakuContext;
    return useMemo<WakuInfo>(() => {
        return {...providerInfo}
    }, [wakuContext])
}

export const useWakuDecoder = (contentTopic: string) => {
    return useMemo(() => {
        return createDecoder(contentTopic)
    }, [contentTopic])
}

interface Props {
    updateStatus: (msg: string, typ: string, delay?: number) => void
    children: React.ReactNode
}

export const WakuContextProvider = ({ children, updateStatus }: Props) => {
    const [status, setStatus] = useState<string>("disconnected")
    const [connected, setConnected] = useState<boolean>(false)
    const [connecting, setConnecting] = useState<boolean>(false)
    const [node, setNode] = useState<LightNode>()
    const [health, setHealth] = useState<HealthStatus>(HealthStatus.Unhealthy)

    const start = useCallback(async () => {

        if (connected || connecting || node) return
        setConnecting(true)
        setStatus("starting")
        updateStatus("Starting Waku node", "info", 2000)
        await createLightNode({
            networkConfig: {clusterId: 42, shards: [0]},
            defaultBootstrap: false,
            bootstrapPeers: BOOTSTRAP_NODES,
            numPeersToUse: 1,
            
        }).then( async (ln: LightNode) => {
            if (node) return
            setNode(ln)
            setStatus("connecting")

            ln.connectionManager.addEventListener(EConnectionStateEvents.CONNECTION_STATUS, (e) => {
                //console.log(e)
            })

            
            try {
                updateStatus("Waiting for a peer", "success", 3000)
                await waitForRemotePeer(ln, [Protocols.Filter, Protocols.LightPush, Protocols.Store])
                updateStatus("Waku node successfully connected", "success", 5000)
                console.log(await ln.libp2p.peerStore.all())
                ln.health.addEventListener(HealthStatusChangeEvents.StatusChange, (hs) => {
                        setHealth(hs.detail)
                    })
                setStatus("connected")
                setConnected(true)
                setConnecting(false)
            } finally {
                setConnecting(false)
            }
        })


     }, [])

    const stop = () => {
        node?.stop()
        setConnected(false)
        setStatus("stopped")
    }
    


    const wakuInfo = useMemo(
        () => ({
            node,
            status,
            connected,
            start,
            stop,
            health,
        }),
        [
            node,
            status,
            connected,
            start,
            stop,
            health,
        ]
    )

    return ( <WakuContext.Provider value={{ providerInfo: wakuInfo }}>
        { children }
    </WakuContext.Provider>)
}