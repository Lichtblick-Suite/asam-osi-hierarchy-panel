import { renderHook } from "@testing-library/react";

import useTreeView from "../hooks/useTreeView";

describe("tree view hook", () => {
  const { result } = renderHook(() => useTreeView());

  it("convert time in nanosecond ", () => {
    expect(result.current.isDefaultExpanded(["test", "test2"], { name: "test" })).toBe(true);
  });
});
