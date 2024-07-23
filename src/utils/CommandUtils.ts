import { invoke } from "@tauri-apps/api/tauri";
import { Config } from "../config/globals";
import { getOS } from "./system/OSUtilities";

export async function ExecuteCommand(command: string, args: string[], emit_event: boolean = false) {
    await invoke("execute_command", {
        command: command,
        args: args,
        emitEvent: emit_event
    });
}

export async function greet() {
    await ExecuteCommand("echo", ["Hello there from hello.app!"]);
}

export function GetHelloNodeUrl() {
    const releases = "https://github.com/Hello-Storage/hello-ipfs-user-node/releases/download/";
    const helloNodeVersion = Config.hello_node_version;
    const os_name = getOS();
    return releases + helloNodeVersion + "/ipfs-user-node-" + os_name + "-" + helloNodeVersion + (os_name == "windows" ? ".exe" : "");
}
