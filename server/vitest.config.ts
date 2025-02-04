import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	root: "./src",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
