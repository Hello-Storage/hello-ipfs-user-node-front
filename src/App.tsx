import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";
import "./App.css";

function App() {
	const [greetMsg, setGreetMsg] = useState("");
	const [name, setName] = useState("");
	const [enabled, setEnabled] = useState(false);

	async function greet() {
		setGreetMsg(await invoke("greet", { name }));
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

	return (
		<div className="container">
			<form
				className="row"
				onSubmit={(e) => {
					e.preventDefault();
					greet();
				}}
			>
				<input
					id="greet-input"
					onChange={(e) => setName(e.currentTarget.value)}
					placeholder="Enter a name..."
				/>
				<button type="submit">Greet</button>
			</form>

			<button onClick={switchAutostart}>{enabled ? "Disable autostart" : "Enable autostart"}</button>

			<p>{greetMsg}</p>
		</div>
	);
}

export default App;
