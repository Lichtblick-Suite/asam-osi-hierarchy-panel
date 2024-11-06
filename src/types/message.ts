import { Time } from "@lichtblick/suite";

export interface BaseParam {
  context: string;
  id?: number;
  value: boolean | number | string;
  time: Time;
}

export interface RenderTree {
  id: number;
  name: string;
  value?: number | boolean | null;
  time: Time;
  label: string;
  children?: RenderTree[];
  index: number;
}
