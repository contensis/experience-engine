import { useEffect, useState } from "react";
import ReactSwitch from "react-switch";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { googlecode as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { usePersonalizationContext } from "@contensis/personalization-react";
import {
  Condition,
  IAudience,
  PersonalizationContext,
} from "@contensis/personalization";
import {
  getCoreRowModel,
  getExpandedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import AudiencesTable from "./Table";
import Collapsible from "./Collapsible";
import { mapConditions, recalculateSignals } from "../util";

import activeCheck from "../assets/green_checkmark.svg";

SyntaxHighlighter.registerLanguage("json", json);

type ConditionData = Condition & {
  logic: string;
};

const ConditionsTable = ({
  context,
  row,
  data,
}: {
  context?: PersonalizationContext;
  data: ConditionData[];
  row: Row<IAudience>;
}) => {
  const table = useReactTable({
    columns: [
      {
        id: "isAudienceActive",
        header: " ",
        meta: {
          className: "active-check",
        },

        cell: (props) => {
          const row = props.row.original;
          if (!("type" in row)) return null;

          const state = context?.state;
          let checked = false;
          if (row.type === "audience") {
            checked = state?.audiences?.active.includes(row.id) || false;
          }

          if (row.type === "signal") {
            checked = state?.signals?.active.includes(row.id) || false;
          }

          return (row.logic.endsWith(".not") ? !checked : checked) ? (
            <div style={{ textAlign: "right" }}>
              <img
                src={activeCheck}
                alt={`${
                  row.logic.endsWith(".not") ? `Did not match` : `Matched`
                } ${row.type} ${row.id}`}
                title={`${
                  row.logic.endsWith(".not") ? `Did not match` : `Matched`
                } ${row.type} ${row.id}`}
                style={{ width: "16px" }}
              />
            </div>
          ) : null;
        },
      },
      {
        header: "Group",
        accessorKey: "logic",
      },
      {
        header: "Type",
        accessorKey: "type",
      },
      {
        header: "Id",
        accessorKey: "id",
      },
    ],
    data,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <>
      <AudiencesTable table={table} />
      <Collapsible label={"raw JSON"}>
        <div className="json-panel" style={{ padding: "2em" }}>
          <SyntaxHighlighter language="json" style={theme}>
            {JSON.stringify(row.original, null, 2)}
          </SyntaxHighlighter>
        </div>
      </Collapsible>
    </>
  );
};
const Audiences = ({ ids }: { ids?: string[] }) => {
  const { context, isAudience, manifest, state } = usePersonalizationContext();
  const audiences = manifest?.audiences ?? [];
  const table = useReactTable({
    columns: [
      {
        id: "isAudienceActive",
        header: " ",
        accessorFn: ({ id }) => isAudience(id),
        cell: (props) => (
          <label title="Activate or deactivate this audience">
            <span></span>
            <ReactSwitch
              onChange={() => {
                const audienceId = props.row.original.id;
                const checked = isAudience(audienceId);
                // const state = context?.state;
                if (context && state?.audiences) {
                  if (!state.audiences.active) state.audiences.active = [];
                  if (!state.audiences.matched) state.audiences.matched = {};
                  if (checked) {
                    // "Uncheck" audience by removing the id from the active array
                    // and clear all previous matches in the store
                    // We can get away with just mutating state here
                    state.audiences.active = state.audiences.active.filter(
                      (a) => a !== audienceId
                    );
                    delete state.audiences.matched[audienceId];
                  } else {
                    // Add audience id to the active array
                    // state.audiences.active.push(audienceId);
                    state.audiences.matched[audienceId] = [
                      { p: "preview", t: 0 },
                    ];
                  }
                  recalculateSignals(context, state);
                }
              }}
              height={22}
              className="react-switch"
              checked={isAudience(props.row.original.id)}
            />
          </label>
        ),
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: (props) => (
          <>
            {props.getValue()}
            <br />
            <code>{props.row.original.id}</code>
          </>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
      },
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: "pointer" },
              }}
            >
              {row.getIsExpanded() ? "👇" : "🤔"}
            </button>
          ) : (
            "🔵"
          );
        },
      },
    ],
    data: (ids ? audiences.filter((a) => ids.includes(a.id)) : audiences).sort(
      (a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      }
    ),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });
  const [conditions, setConditions] = useState<[string, ConditionData[]][]>([]);
  useEffect(() => {
    setConditions(
      (manifest?.audiences ?? []).map((audience) => [
        audience.id,
        mapConditions(audience?.conditions),
      ])
    );
  }, [manifest?.audiences, isAudience]);

  return (
    <AudiencesTable
      table={table}
      renderSubComponent={(row) => {
        const audienceId = row.original.id;
        const data = conditions.find(([id]) => id === audienceId)?.[1] || [];
        return <ConditionsTable row={row} data={data} context={context} />;
      }}
    />
  );
};
export default Audiences;
