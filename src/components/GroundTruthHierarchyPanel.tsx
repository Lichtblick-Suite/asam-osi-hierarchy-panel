import { PanelExtensionContext } from "@lichtblick/suite";
import React, { useEffect, useLayoutEffect, ReactElement } from "react";
import * as ReactDOM from "react-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";

import TreeView from "./TreeView";
import useGroundTruthHierarchy from "../hooks/useGroundTruthHierarchy";
import { RenderTree } from "../types/message";

function GroundTruthHierarchyPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const {
    defaultSelected,
    items,
    renderDone,
    setCurrentFilter,
    setDefaultSelected,
    handleChange,
    metaData,
  } = useGroundTruthHierarchy();

  useLayoutEffect(() => {
    handleChange(context as Pick<PanelExtensionContext, "onRender">);

    context.watch("currentFrame");
    context.subscribe(["/sim/groundtruth_topic"]);
  }, [context, handleChange]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  const renderTree = (nodes: RenderTree) =>
    Array.isArray(nodes.children) &&
    nodes.children.map((node) => (
      <TreeView
        defaultSelected={defaultSelected}
        onSelectedChanged={setDefaultSelected}
        key={node.name}
        node={node}
      />
    ));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          fontWeight: 400,
          fontSize: "0.642857rem",
          lineHeight: 1.2,
          color: "rgb(167, 166, 175)",
          padding: 5,
        }}
      >
        {metaData}
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
          }}
        >
          <input
            type="search"
            onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCurrentFilter(event.target.value);
            }}
            style={{
              background: "none",
              border: "1px solid rgb(167, 166, 175)",
              color: "currentColor",
              width: "100%",
              marginLeft: "-16px",
              paddingLeft: "20px",
            }}
          />
          <FaMagnifyingGlass />
        </div>
      </div>
      <div
        style={{
          overflow: "auto",
          padding: "1rem",
          scrollbarGutter: "stable",
        }}
      >
        {items && renderTree(items)}
      </div>
    </div>
  );
}

export default GroundTruthHierarchyPanel;

export function initGroundTruthHierarchyPanel(context: PanelExtensionContext): void {
  ReactDOM.render(<GroundTruthHierarchyPanel context={context} />, context.panelElement);
}
