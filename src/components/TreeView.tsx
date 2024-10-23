import React, { ReactElement, useEffect } from "react";
import { IconType } from "react-icons";
import { FaCar, FaCube, FaRoad, FaSignsPost, FaTrafficLight, FaUser } from "react-icons/fa6";
import { PiRoadHorizonFill } from "react-icons/pi";

import TreeViewChilds from "./TreeViewChilds";
import useTreeView from "../hooks/useTreeView";
import { RenderTree } from "../types/message";

interface TreeViewProps {
  node: RenderTree;
  defaultSelected: string[];
  onSelectedChanged: (ids: string[]) => void;
  key?: React.Key;
}

const NodeIconMap: { [key: string]: IconType } = {
  Vehicles: FaCar,
  Pedestrians: FaUser,
  "Stationary Objects": FaCube,
  Lanes: FaRoad,
  "Lane Boundaries": PiRoadHorizonFill,
  "Traffic Signs": FaSignsPost,
  "Traffic Lights": FaTrafficLight,
};

export default function TreeView(props: TreeViewProps): ReactElement {
  const { visible, isDefaultExpanded, setVisible } = useTreeView();

  const renderChilds = () => {
    return isDefaultExpanded(props.defaultSelected, props.node) || visible ? (
      <TreeViewChilds
        onSelectedChanged={props.onSelectedChanged}
        defaultSelected={props.defaultSelected}
        node={props.node}
        key={props.key}
      />
    ) : null;
  };

  const renderNodeIcon = (category: string) => {
    const NodeIcon = NodeIconMap[category];
    return NodeIcon ? <NodeIcon /> : null;
  };

  useEffect(() => {
    const initalVisible = isDefaultExpanded(props.defaultSelected, props.node);
    setVisible(initalVisible);
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: 0.5,
          paddingRight: 0,
          borderBottom: "0.3px solid #282828",
          cursor: props.node.children ? "pointer" : "default",
        }}
      >
        <div color="inherit" style={{ marginRight: 1 }} />
        <div
          style={{
            fontWeight: "inherit",
            flexGrow: 1,
            fontSize: "0.875rem",
          }}
        >
          <div
            onClick={() => {
              const ids = props.defaultSelected.includes(props.node.name)
                ? props.defaultSelected.filter((x) => x !== props.node.name)
                : [...props.defaultSelected, props.node.name];

              props.onSelectedChanged(ids);

              setVisible(
                props.defaultSelected.find((x) => x === props.node.name) ? false : !visible,
              );
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              paddingLeft: 12 * props.node.index,
            }}
          >
            {props.node.children && props.node.children.length > 0 ? (
              <span
                style={Object.assign(
                  { fontSize: "0.6rem" },
                  visible ? { transform: "rotate(90deg)" } : {},
                )}
              >
                &#10148;
              </span>
            ) : (
              renderNodeIcon(props.node.name.split("/")[0] ?? "")
            )}

            {props.node.value != undefined ? (
              <div title={"time: " + props.node.time.sec + "." + props.node.time.nsec}>
                <div>{props.node.label}</div>
              </div>
            ) : (
              <div>{props.node.label}</div>
            )}
          </div>
        </div>
        <div
          style={{
            fontSize: "0.875rem",
          }}
        >
          {typeof props.node.value === "boolean"
            ? props.node.value
              ? "true"
              : "false"
            : props.node.value}
        </div>
      </div>

      {renderChilds()}
    </div>
  );
}
