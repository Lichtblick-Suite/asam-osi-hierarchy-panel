import { useState, useEffect } from "react";
import { SettingsTree, SettingsTreeAction, SettingsTreeFields } from "@lichtblick/suite";

interface SelectedTopic {
  name: string;
  schema: string;
}
const usePanelSettings = (
  schemaList: string[],
  filteredSchemas: string[],
  filteredTopics: any[],
  setFilteredSchemas: (schemas: string[]) => void,
  selectedTopic: SelectedTopic,
  setSelectedTopic: (selectedTopic: SelectedTopic) => void,
) => {
  const [options, setOptions] = useState([{ label: "", value: "" }]);

  useEffect(() => {
    const optionsArray = filteredTopics.map((topic: any) => ({
      label: topic.subscription.topic,
      value: topic.schema,
    }));
    setOptions(optionsArray);
  }, [filteredTopics]);

  const createSchemaFields = (schemaList: string[], filteredSchemas: string[]) => {
    return Object.fromEntries(
      schemaList.map((schema) => [
        schema,
        { label: schema, input: "boolean", value: filteredSchemas.includes(schema) },
      ]),
    ) as SettingsTreeFields;
  };

  const createTopicsFields = (selectedTopic: SelectedTopic, options: any[]) => {
    return {
      topic: {
        label: "Topic",
        input: "select",
        value: selectedTopic.name,
        options,
      },
    } as SettingsTreeFields;
  };

  const handleAction = (
    action: SettingsTreeAction,
    filteredSchemas: string[],
    setFilteredSchemas: (schemas: string[]) => void,
    setSelectedTopic: (selectedTopic: SelectedTopic) => void,
  ) => {
    switch (action.action) {
      case "perform-node-action":
        break;
      case "update":
        if (action.payload.path[0] === "schemas") {
          const schemaListArray = [...filteredSchemas];
          const selectedSchema: string = action?.payload?.path[1] as string;
          const isChecked: boolean = action?.payload?.value as boolean;
          if (isChecked) {
            if (!filteredSchemas.includes(selectedSchema)) {
              schemaListArray.push(selectedSchema);
              setFilteredSchemas(schemaListArray);
            }
          } else {
            const updatedSchemaList = schemaListArray.filter((schema) => schema !== selectedSchema);
            setFilteredSchemas(updatedSchemaList);
            selectedTopic.schema === selectedSchema && setSelectedTopic({ name: "", schema: "" });
          }
        }
        if (action.payload.path[0] === "topics" && action.payload.path[1] === "topic") {
          const topicSchema: string = action?.payload?.value as string;
          const topicName: string = options.find((option) => option.value === topicSchema)
            ?.label as string;
          setSelectedTopic({ name: topicName, schema: topicSchema });
        }
        break;
    }
  };

  const panelSettings: SettingsTree = {
    nodes: {
      schemas: {
        label: "Schema Selection",
        fields: createSchemaFields(schemaList, filteredSchemas),
      },
      topics: {
        label: "Visualized Topic",
        fields: filteredTopics.length > 0 ? createTopicsFields(selectedTopic, options) : undefined,
      },
    },
    actionHandler: (action: SettingsTreeAction) =>
      handleAction(action, filteredSchemas, setFilteredSchemas, setSelectedTopic),
  };

  return {
    panelSettings,
  };
};

export default usePanelSettings;
