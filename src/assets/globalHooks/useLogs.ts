import { useState } from "react";

export function useLogs() {
    const [logs, setLogs] = useState("");

    const addLog = (newLine: string) => {
        // update logs
        setLogs((logs) => logs + newLine + "\n");
        // scroll to bottom
        const textarea = document.getElementById("logs");
        if (textarea) {
            textarea.scrollTop = textarea.scrollHeight + 100;
        }
    }

    return { logs, addLog };

}