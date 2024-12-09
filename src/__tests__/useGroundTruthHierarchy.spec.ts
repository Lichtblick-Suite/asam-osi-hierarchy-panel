import { renderHook } from "@testing-library/react";

import useGroundTruthHierarchy from "../hooks/useGroundTruthHierarchy";
import { GroundTruth, MovingObject_Type, SensorView } from "@lichtblick/asam-osi-types";

describe("ground truth hierarchy hook", () => {
  const { result } = renderHook(() => useGroundTruthHierarchy());

  const baseParams = [
    { context: "test/test1/test2/test3", time: { nsec: 1000000, sec: 100000000 }, value: false },
    { context: "test/test1/test4", time: { nsec: 1000000, sec: 100000000 }, value: 0.2 },
    { context: "test5/test6/test7", time: { nsec: 1000000, sec: 100000000 }, value: 0.1 },
    {
      context: "test8/test9/test99/test88",
      time: { nsec: 1000000, sec: 100000000 },
      value: 25,
    },
    {
      context: "test8/test44",
      time: { nsec: 1000000, sec: 100000000 },
      value: "test_value",
    },
  ];

  const message = {
    host_vehicle_id: {
      value: 0,
    },
    moving_object: [
      {
        id: {
          value: 0,
        },
        type: MovingObject_Type.VEHICLE,
      },
      {
        id: {
          value: 1,
        },
        type: MovingObject_Type.VEHICLE,
      },
      {
        id: {
          value: 2,
        },
        type: MovingObject_Type.PEDESTRIAN,
      },
    ],
    stationary_object: [
      {
        id: {
          value: 3,
        },
      },
    ],
    lane: [
      {
        id: {
          value: 4,
        },
      },
    ],
    lane_boundary: [
      {
        id: {
          value: 5,
        },
      },
    ],
    traffic_sign: [
      {
        id: {
          value: 6,
        },
      },
    ],
    traffic_light: [
      {
        id: {
          value: 7,
        },
      },
    ],
  } as GroundTruth;

  it("convert time in nanosecond ", () => {
    expect(result.current.getTime({ sec: 3310458, nsec: 925238075 })).toBe(3310458.925238075);
  });

  it("mapParams", () => {
    const expected = [
      {
        context: "Vehicles/Host Vehicle/Host Vehicle 0",
        id: 0,
        time: { nsec: 1000000, sec: 100000000 },
        value: "",
      },
      {
        context: "Vehicles/Traffic Vehicles/Traffic Vehicle 1",
        id: 1,
        time: { nsec: 1000000, sec: 100000000 },
        value: "",
      },
      {
        context: "Pedestrians/Pedestrian 2",
        id: 2,
        time: { nsec: 1000000, sec: 100000000 },
        value: "",
      },
    ];
    expect(
      result.current.mapParams({
        schemaName: "osi3.GroundTruth",
        message,
        receiveTime: { nsec: 1000000, sec: 100000000 },
        sizeInBytes: 1000,
        topic: "",
        publishTime: { nsec: 1000000, sec: 100000000 },
      }),
    ).toEqual(expect.arrayContaining(expected));
    expect(
      result.current.mapParams({
        schemaName: "osi3.SensorView",
        message: {
          global_ground_truth: message,
        } as SensorView,
        receiveTime: { nsec: 1000000, sec: 100000000 },
        sizeInBytes: 1000,
        topic: "",
        publishTime: { nsec: 1000000, sec: 100000000 },
      }),
    ).toEqual(expect.arrayContaining(expected));
  });

  it("mapBaseParams", () => {
    const value = result.current.mapBaseParam(baseParams, { sec: 3310458, nsec: 925238075 });
    expect(value).toEqual(
      expect.arrayContaining([
        {
          context: "test/test1/test2/test3",
          time: { nsec: 925238075, sec: 3310458 },
          value: false,
        },
      ]),
    );
  });

  it("convert tree view object ", () => {
    const value = result.current.createTreeView(baseParams);
    expect(value).toEqual({
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      index: 3,
                      label: "test3",
                      name: "test/test1/test2/test3",
                      time: { nsec: 1000000, sec: 100000000 },
                      value: false,
                    },
                  ],
                  index: 2,
                  label: "test2",
                  name: "test/test1/test2",
                  time: { nsec: 1000000, sec: 100000000 },
                },
                {
                  index: 2,
                  label: "test4",
                  name: "test/test1/test4",
                  time: { nsec: 1000000, sec: 100000000 },
                  value: 0.2,
                },
              ],
              index: 1,
              label: "test1",
              name: "test/test1",
              time: { nsec: 1000000, sec: 100000000 },
            },
          ],
          index: 0,
          label: "test",
          name: "test",
          time: { nsec: 1000000, sec: 100000000 },
        },
        {
          children: [
            {
              children: [
                {
                  index: 2,
                  label: "test7",
                  name: "test5/test6/test7",
                  time: { nsec: 1000000, sec: 100000000 },
                  value: 0.1,
                },
              ],
              index: 1,
              label: "test6",
              name: "test5/test6",
              time: { nsec: 1000000, sec: 100000000 },
            },
          ],
          index: 0,
          label: "test5",
          name: "test5",
          time: { nsec: 1000000, sec: 100000000 },
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      index: 3,
                      label: "test88",
                      name: "test8/test9/test99/test88",
                      time: { nsec: 1000000, sec: 100000000 },
                      value: 25,
                    },
                  ],
                  index: 2,
                  label: "test99",
                  name: "test8/test9/test99",
                  time: { nsec: 1000000, sec: 100000000 },
                },
              ],
              index: 1,
              label: "test9",
              name: "test8/test9",
              time: { nsec: 1000000, sec: 100000000 },
            },
            {
              index: 1,
              label: "test44",
              name: "test8/test44",
              time: { nsec: 1000000, sec: 100000000 },
              value: "test_value",
            },
          ],
          index: 0,
          label: "test8",
          name: "test8",
          time: { nsec: 1000000, sec: 100000000 },
        },
      ],
    });
  });

  it("getMetaData", () => {
    expect(result.current.getMetaData("test", { nsec: 1000000, sec: 1000000 })).toEqual(
      "test @ 1000000.001000000 sec",
    );
  });
});
