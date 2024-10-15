// @ts-nocheck
import { MessageEvent, PanelExtensionContext, RenderState, Time } from "@lichtblick/suite";
import { useEffect, useState } from "react";

import { BaseParam, Message, RenderTree, MovivngObjectEnum } from "../types/message";

// import { Time } from "@foxglove/schemas/schemas/typescript/Time";

export function formatTimeRaw(stamp: Time): string {
  return `${stamp?.sec}.${stamp?.nsec.toFixed().padStart(9, "0")}`;
}

export default function useGroundTruthHierarchy() {
  const [currentFilter, setCurrentFilter] = useState<string>();
  const [currentAllParams, setCurrentAllParams] = useState<BaseParam[]>([]);
  const [items, setItems] = useState<RenderTree>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [defaultSelected, setDefaultSelected] = useState<string[]>([
    "Vehicles",
    "Vehicles/Host Vehicle",
    "Vehicles/Traffic Vehicles",
    "Pedestrians",
    "Stationary Objects",
    "Lanes",
    "Lane Boundaries",
    "Traffic Signs",
    "Traffic Lights",
  ]);
  const [metaData, setMetaData] = useState<string>("");

  const mapBaseParam = (params: BaseParam[], time: Time): BaseParam[] =>
    params.map(
      (y: BaseParam): BaseParam => ({
        context: y.context,
        value: y.value,
        time,
      }),
    );

  const getMetaData = (schemaName: string, time: Time) => {
    return `${schemaName} @ ${formatTimeRaw(time)} sec`;
  };

  const createTreeView = (params: BaseParam[]) => {
    const mapper: any = {};
    const tree: any = {};

    for (const str of params) {
      let splits = str.context.split("/"),
        name = "";

      splits.reduce((parent, place, i) => {
        name ? (name += `/${place}`) : (name = place);

        if (!mapper[name]) {
          let o;
          const label = name?.split("/")[name.split("/").length - 1];

          if (splits.length - 1 === i) {
            o = {
              name,
              label,
              id: str.id,
              value: str.value,
              time: str.time,
              index: i,
            };
          } else {
            o = {
              name,
              label,
              time: str.time,
              index: i,
            };
          }

          mapper[name] = o;
          parent.children = parent.children || [];
          parent.children.push(o);
        } else if (splits.length - 1 === i || !str.context.includes("/")) {
          mapper[name].value = str.value;
          mapper[name].time = str.time;
          mapper[name].index = i;
        }

        return mapper[name];
      }, tree);
    }

    return tree;
  };

  const createTreeItem = (path: string, id: number, time: Time): BaseParam => ({
    context: `${path} ${id}`,
    id,
    value: "",
    time,
  });

  useEffect(() => {
    if (currentFilter) {
      const regex = new RegExp(currentFilter, "i");
      const currentFilteredParams = currentAllParams.filter((x) => regex.test(x.context));
      const filteredTree = createTreeView(currentFilteredParams);
      setItems(filteredTree);
    } else {
      const tree = createTreeView(currentAllParams);
      setItems(tree);
    }
  }, [currentAllParams, currentFilter]);

  const mapParams = (params: MessageEvent<Message>) => {
    const host_vehicle = params.message.moving_object
      .filter((x) => x.id.value === params.message.host_vehicle_id.value)
      .map((x) =>
        createTreeItem("Vehicles/Host Vehicle/Host Vehicle", x.id.value, params.receiveTime),
      );
    const traffic_vehicles = params.message.moving_object
      .filter(
        (x) =>
          x.type.value === MovivngObjectEnum.TYPE_VEHICLE &&
          x.id.value !== params.message.host_vehicle_id.value,
      )
      .map((x) =>
        createTreeItem("Vehicles/Traffic Vehicles/Traffic Vehicle", x.id.value, params.receiveTime),
      );
    const pedestrians = params.message.moving_object
      .filter((x) => x.type.value === MovivngObjectEnum.TYPE_PEDESTRIAN)
      .map((x) => createTreeItem("Pedestrians/Pedestrian", x.id.value, params.receiveTime));
    const stationary_objects = params.message.stationary_object.map((x) =>
      createTreeItem("Stationary Objects/Stationary Object", x.id.value, params.receiveTime),
    );
    const lanes = params.message.lane.map((x) =>
      createTreeItem("Lanes/Lane", x.id.value, params.receiveTime),
    );
    const lane_boundaries = params.message.lane_boundary.map((x) =>
      createTreeItem("Lane Boundaries/Lane Boundary", x.id.value, params.receiveTime),
    );
    const traffic_signs = params.message.traffic_sign.map((x) =>
      createTreeItem("Traffic Signs/Traffic Sign", x.id.value, params.receiveTime),
    );
    const traffic_lights = params.message.traffic_light.map((x) =>
      createTreeItem("Traffic Lights/Traffic Light", x.id.value, params.receiveTime),
    );

    return [
      ...host_vehicle,
      ...traffic_vehicles,
      ...pedestrians,
      ...stationary_objects,
      ...lanes,
      ...lane_boundaries,
      ...traffic_lights,
      ...traffic_signs,
    ];
  };

  const getTime = (time?: Time) => {
    const sec = time?.sec ?? 0;
    const nsec = time?.nsec ?? 0;

    return sec + nsec / 1000000000;
  };

  const handleChange = (context: Pick<PanelExtensionContext, "onRender">) => {
    context.onRender = (render_state: RenderState, done) => {
      if (!render_state?.currentFrame) {
        setRenderDone(() => done);
        return;
      } else {
        const value = render_state.currentFrame?.at(-1) as MessageEvent<Message>;
        if (value) {
          const data = getMetaData(value.schemaName, value.receiveTime);
          setMetaData(data);
          const params = mapParams(value);
          setCurrentAllParams(params);
        }
      }
      setRenderDone(() => done);
    };
  };

  return {
    items,
    renderDone,
    setCurrentFilter,
    defaultSelected,
    setDefaultSelected,
    mapParams,
    getTime,
    handleChange,
    mapBaseParam,
    createTreeView,
    metaData,
    getMetaData,
  };
}
