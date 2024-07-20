import { useEffect, useState } from "react";
import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";
import "./App.css";
import "./assets/styles/wave.css";
import "./assets/styles/card.css";
import { ExecuteCommand } from "./utils/CommandUtils";

function App() {
	const [enabledAutostart, setEnabledAutostart] = useState(false);
	const [logs, setLogs] = useState("");
	const executableurl =
		"https://github.com/Hello-Storage/hello-ipfs-user-node/releases/download/0.0.1/ipfs-user-node-windows-0.0.1.exe";

	async function greet() {
		await ExecuteCommand("echo", ["Hello there from hello.app!"]);
	}

	useEffect(() => {
		window.FunctionOutputLogger = function (msg: string) {
			// update logs
			setLogs(logs + msg + "\n");
			// scroll to bottom
			const textarea = document.getElementById("logs");
			if (textarea) {
				textarea.scrollTop = textarea.scrollHeight + 100;
			}
		};
	}, [logs]);

	useEffect(() => {
		greet();

		// check if hello node is installed (from localstorage)
		let helloNodeInstalled = localStorage.getItem("hello-node-installed");
		if (!helloNodeInstalled) {
			// install hello node
			ExecuteCommand("curl", ["-O", "-L", executableurl]).then(() => {
				// update localstorage
				localStorage.setItem("hello-node-installed", "true");
			});
			setLogs(logs + "Hello Node installed\n");
		} else {
			setLogs(logs + "Hello Node already installed\n");
		}

		// detect if autostart is enabled
		isEnabled().then((e) => {
			if (e) {
				setEnabledAutostart(true);
			}
		});
		//
	}, []);

	async function switchAutostart() {
		if (await isEnabled()) {
			await disable();
			setEnabledAutostart(false);
			alert("Autostart disabled");
		} else {
			await enable();
			setEnabledAutostart(true);
			alert("Autostart enabled");
		}
	}

	return (
		<div className="container">
			<section className="wave-background">
				<div className="air air1"></div>
				<div className="air air2"></div>
				<div className="air air3"></div>
				<div className="air air4"></div>
			</section>

			<div className="bgblue">
				<div className="card">
					<textarea
						name="logs"
						id="logs"
						value={logs}
						disabled
					></textarea>
				</div>
			</div>

			<button onClick={switchAutostart}>
				{enabledAutostart ? "Disable autostart" : "Enable autostart"}
			</button>
		</div>
	);
}

export default App;
