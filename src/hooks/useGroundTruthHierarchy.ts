import { MessageEvent, PanelExtensionContext, Time, Topic } from "@lichtblick/suite";
import { useEffect, useState } from "react";
import { GroundTruth, MovingObject_Type, SensorView } from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

import { BaseParam, RenderTree } from "../types/message";

export function formatTimeRaw(stamp: Time): string {
  return `${stamp.sec}.${stamp.nsec.toFixed().padStart(9, "0")}`;
}

export interface GroundTruthHierarchy {
  items: RenderTree | undefined;
  topics: readonly Topic[] | undefined;
  renderDone: (() => void) | undefined;
  setCurrentFilter: React.Dispatch<React.SetStateAction<string | undefined>>;
  defaultSelected: string[];
  setDefaultSelected: React.Dispatch<React.SetStateAction<string[]>>;
  mapParams: (params: MessageEvent<GroundTruth | SensorView>) => BaseParam[];
  getTime: (time: Time) => number;
  handleChange: (context: Pick<PanelExtensionContext, "onRender">) => void;
  mapBaseParam: (params: BaseParam[], time: Time) => BaseParam[];
  createTreeView: (params: BaseParam[]) => RenderTree;
  metaData: string;
  getMetaData: (schemaName: string, time: Time) => string;
}

export default function useGroundTruthHierarchy(): GroundTruthHierarchy {
  const [topics, setTopics] = useState<readonly Topic[] | undefined>();
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

  const createTreeView = (params: BaseParam[]): RenderTree => {
    const mapper: Record<string, RenderTree> = {};
    const tree = {} as RenderTree;

    for (const str of params) {
      const splits = str.context.split("/");
      let name = "";

      splits.reduce<RenderTree>((parent, place, i): RenderTree => {
        if (name) {
          name += `/${place}`;
        } else {
          name = place;
        }

        if (!mapper[name]) {
          let o;
          const label = name.split("/")[name.split("/").length - 1];

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

          mapper[name] = o as RenderTree;
          parent.children = parent.children ?? [];
          parent.children.push(o as RenderTree);
        } else if (splits.length - 1 === i || !str.context.includes("/")) {
          mapper[name]!.value = Number(str.value);
          mapper[name]!.time = str.time;
          mapper[name]!.index = i;
        }

        return mapper[name]!;
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

  const mapParams = (params: MessageEvent<GroundTruth | SensorView>) => {
    const message =
      params.schemaName == "osi3.SensorView"
        ? (params.message as DeepRequired<SensorView>).global_ground_truth
        : (params.message as DeepRequired<GroundTruth>);
    const host_vehicle = message.moving_object
      .filter((x) => x.id.value === message.host_vehicle_id?.value)
      .map((x) =>
        createTreeItem("Vehicles/Host Vehicle/Host Vehicle", x.id.value, params.receiveTime),
      );
    const traffic_vehicles = message.moving_object
      .filter(
        (x) =>
          x.type === MovingObject_Type.VEHICLE && x.id.value !== message.host_vehicle_id?.value,
      )
      .map((x) =>
        createTreeItem("Vehicles/Traffic Vehicles/Traffic Vehicle", x.id.value, params.receiveTime),
      );
    const pedestrians = message.moving_object
      .filter((x) => x.type === MovingObject_Type.PEDESTRIAN)
      .map((x) => createTreeItem("Pedestrians/Pedestrian", x.id.value, params.receiveTime));
    const stationary_objects = message.stationary_object.map((x) =>
      createTreeItem("Stationary Objects/Stationary Object", x.id.value, params.receiveTime),
    );
    const lanes = message.lane.map((x) =>
      createTreeItem("Lanes/Lane", x.id.value, params.receiveTime),
    );
    const lane_boundaries = message.lane_boundary.map((x) =>
      createTreeItem("Lane Boundaries/Lane Boundary", x.id.value, params.receiveTime),
    );
    const traffic_signs = message.traffic_sign.map((x) =>
      createTreeItem("Traffic Signs/Traffic Sign", x.id.value, params.receiveTime),
    );
    const traffic_lights = message.traffic_light.map((x) =>
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

  const getTime = (time: Time) => {
    return time.sec + time.nsec / 1000000000;
  };

  const handleChange = (context: Pick<PanelExtensionContext, "onRender">) => {
    context.onRender = (render_state, done) => {
      setTopics(render_state.topics);
      if (!render_state.currentFrame) {
        setRenderDone(() => done);
        return;
      } else {
        const value = render_state.currentFrame.at(-1) as
          | MessageEvent<GroundTruth | SensorView>
          | undefined;
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
    topics,
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
