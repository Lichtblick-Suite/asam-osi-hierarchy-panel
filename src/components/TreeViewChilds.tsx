import { ReactElement } from "react";

import TreeView from "./TreeView";
import { RenderTree } from "../types/message";

interface TreeViewChildsProps {
  node: RenderTree;
  defaultSelected: string[];
  onSelectedChanged: (ids: string[]) => void;
}

export default function TreeViewChilds(props: TreeViewChildsProps): ReactElement {
  return (
    <>
      {Array.isArray(props.node.children) &&
        props.node.children.map((node) => (
          <TreeView
            key={node.name}
            defaultSelected={props.defaultSelected}
            onSelectedChanged={props.onSelectedChanged}
            node={node}
          />
        ))}
    </>
  );
}
