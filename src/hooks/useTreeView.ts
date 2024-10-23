import { useState } from "react";

import { RenderTree } from "../types/message";

export interface TreeView {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isDefaultExpanded: (defaultSelected: string[], node: Pick<RenderTree, "name">) => boolean;
}

export default function useTreeView(): TreeView {
  const [visible, setVisible] = useState<boolean>(false);

  return {
    visible,
    setVisible,
    isDefaultExpanded: (defaultSelected, node) => !!defaultSelected.find((x) => x === node.name),
  };
}
