import { invoke } from "@tauri-apps/api/tauri";

export async function ExecuteCommand(command: string, args: string[]) {
    await invoke("executeCommand", {
        command: command,
        args: args
    });
}