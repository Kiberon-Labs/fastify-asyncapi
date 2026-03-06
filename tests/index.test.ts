import { describe, expect, it } from "vitest";
import {
	AsyncAPIDocument,
	fastifyAsyncAPI,
	generateHTML,
} from "../src/index.js";

describe("Package exports", () => {
	it("should export AsyncAPIDocument class", () => {
		expect(AsyncAPIDocument).toBeDefined();
		expect(typeof AsyncAPIDocument).toBe("function");
	});

	it("should export fastifyAsyncAPI plugin", () => {
		expect(fastifyAsyncAPI).toBeDefined();
		expect(typeof fastifyAsyncAPI).toBe("function");
	});

	it("should export generateHTML function", () => {
		expect(generateHTML).toBeDefined();
		expect(typeof generateHTML).toBe("function");
	});
});
