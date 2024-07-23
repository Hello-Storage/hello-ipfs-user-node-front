import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
	{
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
		...pluginReactConfig,
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	{
		ignores: ["dist/*", "node_modules/*", "src-tauri/*"],
	},
	{
		rules: {
			"react/react-in-jsx-scope": "off",
		},
	},
	{ languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
];
