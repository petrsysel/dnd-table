import { produce } from "sveltekit-sse";
import type { RequestEvent } from "./$types";

function delay(milliseconds: number) {
    return new Promise(res => {
        setTimeout(res, milliseconds)
    })
}

export const POST = async (ev: RequestEvent) => {
    console.log("connected")
    return produce(async (connection) => {
        while(true){
            const {error} = connection.emit('message', `The time is ${Date.now()}`)
            if(error){
                // console.log("Connection error:")
                // console.log(error)
                return
            }
            await delay(1000)
        }
    })
}