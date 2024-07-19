import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";
import "./App.css";

function App() {
	const [enabled, setEnabled] = useState(false);

	async function greet() {
		await invoke("executeEcho");
	}

	useEffect(() => {
		isEnabled().then((e) => {
			if (e) {
				setEnabled(true);
			}
		});
	}, []);

	async function switchAutostart() {
		if (await isEnabled()) {
			await disable();
			setEnabled(false);
			alert("Autostart disabled");
		} else {
			await enable();
			setEnabled(true);
			alert("Autostart enabled");
		}
	}

	window.FunctionOutputLogger = function (msg: string) {
		console.log(msg);
	};

	return (
		<div className="container">
			<button onClick={switchAutostart}>
				{enabled ? "Disable autostart" : "Enable autostart"}
			</button>
			<button onClick={greet}>test</button>
		</div>
	);
}

export default App;
