import { useEffect, useState } from "react";
import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";
import "./App.css";
import "./assets/styles/wave.css";
import "./assets/styles/card.css";
import { ExecuteCommand, GetHelloNodeUrl, greet } from "./utils/CommandUtils";
import { useLogs } from "./assets/globalHooks/useLogs";
import { listen } from "@tauri-apps/api/event";

function App() {
	const [enabledAutostart, setEnabledAutostart] = useState(false);
	const { logs, addLog } = useLogs();
	const [executableurl, setExecutableurl] = useState<string | undefined>();
	const [executing, setExecuting] = useState<string | undefined>();
	const [executed, setExecuted] = useState<string | undefined>();

	useEffect(() => {
		greet();
		//get the url of the hello node
		setExecutableurl(GetHelloNodeUrl());
		// detect if autostart is enabled
		isEnabled().then((e) => {
			if (e) {
				setEnabledAutostart(true);
			}
		});

		//listen the event "command_executed"
		listen("command_executed", (event) => {
			setExecuted(event.payload as string);
		});
	}, []);

	useEffect(() => {
		window.FunctionOutputLogger = function (msg: string) {
			addLog(msg);
		};
	}, [logs]);

	useEffect(() => {
		if (!executableurl) return;
		// check if hello node is installed (from localstorage)
		let helloNodeInstalled = localStorage.getItem("hello-node-installed");
		if (!helloNodeInstalled) {
			setExecuting("curl");
			// install hello node
			ExecuteCommand(
				"curl",
				["-O", "-L", executableurl],
				true
			).then(() => {
				// update localstorage
				// localStorage.setItem("hello-node-installed", "true");
				addLog("Hello Node installed");
			});
			addLog("Installing Hello Node");
		} else {
			addLog("Hello Node already installed");
		}
	}, [executableurl]);

	// detect if command (executing) is finished
	useEffect(() => {
		if (!executed) return;
		if(!executing) return;
		if(!executed.includes(executing)) return;
		setExecuting(undefined);
		setExecuted(undefined);
		addLog("Command waited: " + executed);
	}, [executed]);

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
				<div className="log-card">
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
