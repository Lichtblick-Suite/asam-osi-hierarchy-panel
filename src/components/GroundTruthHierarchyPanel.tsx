import { PanelExtensionContext, Subscription } from "@lichtblick/suite";
import React, {
  useEffect,
  useLayoutEffect,
  ReactElement,
  useMemo,
  useState,
  Fragment,
} from "react";
import * as ReactDOM from "react-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import TreeView from "./TreeView";
import useGroundTruthHierarchy from "../hooks/useGroundTruthHierarchy";
import { RenderTree } from "../types/message";
import usePanelSettings from "../hooks/usePanelSettings";
import { FaCircleExclamation, FaTriangleExclamation } from "react-icons/fa6";

interface SelectedTopic {
  name: string;
  schema: string;
}

function GroundTruthHierarchyPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic>({ name: "", schema: "" });
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    defaultSelected,
    items,
    topics,
    renderDone,
    setCurrentFilter,
    setDefaultSelected,
    handleChange,
    metaData,
    error,
    warning,
  } = useGroundTruthHierarchy();
  const schemaList = useMemo(
    () => topics?.map((topic) => topic.schemaName).filter((name) => name.includes("osi")) ?? [],
    [topics],
  );
  const [filteredSchemas, setFilteredSchemas] = useState<string[]>(schemaList);

  useEffect(() => {
    setFilteredSchemas(schemaList);
  }, [schemaList]);

  const filteredTopics = useMemo(
    () =>
      (topics ?? [])
        .filter((topic) => filteredSchemas.includes(topic.schemaName))
        .map((topic, index) => {
          if (index === 0 && !selectedTopic.name)
            setSelectedTopic({ name: topic.name, schema: topic.schemaName });
          const topicSubscription = { topic: topic.name } as Subscription;
          return { subscription: topicSubscription, schema: topic.schemaName };
        }),
    [topics, filteredSchemas],
  );

  const { panelSettings } = usePanelSettings(
    schemaList,
    filteredSchemas,
    filteredTopics,
    setFilteredSchemas,
    selectedTopic,
    setSelectedTopic,
  );
  useEffect(() => {
    context.updatePanelSettingsEditor(panelSettings);
  }, [panelSettings]);

  useLayoutEffect(() => {
    handleChange(context as Pick<PanelExtensionContext, "onRender">);
    context.watch("topics");
    context.watch("currentFrame");
    selectedTopic.name && context.subscribe([{ topic: selectedTopic.name } as Subscription]);
  }, [context, handleChange, selectedTopic]);

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
    <Fragment>
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "red",
            fontSize: "8px",
            marginTop: "8px",
          }}
        >
          <FaCircleExclamation size={12} style={{ margin: "0 5px 0 5px" }} />
          <span>{error}</span>
        </div>
      )}
      {warning && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "orange",
              fontSize: "8px",
              marginTop: "8px",
              cursor: "pointer",
            }}
            onClick={() => setShowTooltip((prev) => !prev)}
          >
            <FaTriangleExclamation size={12} style={{ margin: "0 5px 0 5px" }} />
            <span>{warning.message}</span>
          </div>

          {showTooltip && warning.missingKeys.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                color: "#333",
                padding: "5px",
                fontSize: "10px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                marginTop: "5px",
                zIndex: 1000,
              }}
            >
              {warning.missingKeys.map((key) => {
                return <div key={key}>{key}</div>;
              })}
            </div>
          )}
        </div>
      )}

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
    </Fragment>
  );
}

export default GroundTruthHierarchyPanel;

export function initGroundTruthHierarchyPanel(context: PanelExtensionContext): void {
  ReactDOM.render(<GroundTruthHierarchyPanel context={context} />, context.panelElement);
}
