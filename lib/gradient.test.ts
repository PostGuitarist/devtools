import { describe, expect, it } from "vitest";
import { buildGradientCss } from "./gradient";

describe("buildGradientCss", () => {
  it("builds a linear gradient with angle", () => {
    expect(
      buildGradientCss("linear", 45, [
        { id: "1", color: "#fff" },
        { id: "2", color: "#000" },
      ])
    ).toBe("linear-gradient(45deg, #fff, #000)");
  });

  it("builds a radial gradient ignoring angle", () => {
    expect(
      buildGradientCss("radial", 45, [
        { id: "1", color: "red" },
        { id: "2", color: "blue" },
      ])
    ).toBe("radial-gradient(circle, red, blue)");
  });

  it("supports more than two stops", () => {
    expect(
      buildGradientCss("linear", 90, [
        { id: "1", color: "red" },
        { id: "2", color: "green" },
        { id: "3", color: "blue" },
      ])
    ).toBe("linear-gradient(90deg, red, green, blue)");
  });
});
