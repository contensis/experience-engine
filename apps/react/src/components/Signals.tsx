import ReactSwitch from "react-switch";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { googlecode as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useExperienceEngineContext } from "@contensis/experience-engine-react";
import {
  ComputedSignal,
  EvaluateSignal,
  ISignalAttributes,
  ExperienceEngineContext,
  SignalValue,
  WhereCriteria,
} from "@contensis/experience-engine";
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

type ConditionData = WhereCriteria & {
  logic: string;
};

const ConditionsTable = ({
  context,
  row,
  data,
}: {
  context?: ExperienceEngineContext;
  data: ConditionData[];
  row: Row<ComputedSignal>;
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

          const checked = EvaluateSignal(
            row,
            context?.signals?.attributes[
              row.attribute as keyof ISignalAttributes
            ] as SignalValue
          );

          return (row.logic.endsWith(".not") ? !checked : checked) ? (
            <div style={{ textAlign: "right" }}>
              <img
                src={activeCheck}
                alt={`Attribute ${row.attribute} was matched`}
                title={`Attribute ${row.attribute} was matched`}
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
        header: "Attribute",
        accessorKey: "attribute",
        cell: (props) => <code>{props.getValue()}</code>,
      },
      {
        header: "Value",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        accessorFn: ({ attribute, logic, ...rest }) => Object.values(rest),
        cell: (props) => {
          const row = props.row.original;
          return (
            <code>
              {
                context?.signals?.attributes[
                  row.attribute as keyof ISignalAttributes
                ] as SignalValue
              }
            </code>
          );
        },
      },
      {
        header: "Operator",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        accessorFn: ({ attribute, logic, ...rest }) => Object.keys(rest),
      },
      {
        header: "Operand",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        accessorFn: ({ attribute, logic, ...rest }) => Object.values(rest),
      },
    ],
    data,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });
  return (
    <>
      {!data.length ? (
        <div style={{ textAlign: "center" }}>
          No where conditions in this signal
        </div>
      ) : (
        <AudiencesTable table={table} />
      )}
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

const Signals = () => {
  const { context, manifest, matched, signals, state } =
    useExperienceEngineContext();

  // const [conditions, setConditions] = useState<[string, ConditionData[]][]>([]);
  // useEffect(() => {
  //   setConditions(
  //     (manifest?.signals ?? []).map((signal) => [
  //       signal.id,
  //       mapConditions(signal?.where),
  //     ])
  //   );
  // }, [manifest?.signals, matched.length, signals.length]);

  const conditions = (manifest?.signals ?? []).map<[string, ConditionData[]]>(
    (signal) => [signal.id, mapConditions(signal?.where)]
  );

  const table = useReactTable({
    columns: [
      {
        id: "isSignalActive",
        header: " ",
        accessorFn: ({ id }) => !signals.includes(id),
        cell: (props) => (
          <label title="Activate or deactivate this signal">
            <span></span>
            <ReactSwitch
              onChange={() => {
                const signalId = props.row.original.id;
                const checked = signals.includes(signalId);
                // const state = context?.state;

                if (context && state?.signals) {
                  if (!state.signals.matched) state.signals.matched = {};
                  if (checked) {
                    // "Uncheck" matches by clearing all the previous matches from the store
                    // We can get away with just mutating state here
                    state.signals.matched[signalId] = [];
                    delete state.signals.matched[signalId];
                  } else {
                    // Add synthetic matches to state up to minMatches
                    // minus previous matches
                    const minMatches =
                      manifest?.signals.find((s) => s.id === signalId)
                        ?.minMatches || 0;

                    const matches = state.signals.matched?.[signalId] || [];
                    const numToAdd = minMatches - matches.length || 1; // Add at least 1 if minMatches is 0

                    for (let i = 0; i < numToAdd; i++) {
                      matches.push({
                        p: "preview", // Page is anything here, "preview" helps us identify these as synthetic matches
                        t: i, // An index instead of a timestamp
                      });
                    }

                    state.signals.matched[signalId] = matches;
                  }
                  recalculateSignals(context, state);
                }
              }}
              height={22}
              className="react-switch"
              checked={signals.includes(props.row.original.id)}
            />
          </label>
        ),
      },
      {
        header: "Id",
        accessorKey: "id",
        cell: (props) => <code>{props.getValue()}</code>,
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Min. matches",
        accessorKey: "minMatches",
        cell: (props) => (
          <div style={{ textAlign: "right" }}>{props.getValue()}</div>
        ),
      },
      {
        header: "Times matched",
        accessorKey: "times",
        cell: (props) => (
          <div style={{ textAlign: "right" }}>
            {
              context?.signals?.computed.find(
                (s) => s.id === props.row.original.id
              )?.times
            }
          </div>
        ),
      },
      {
        id: "isSignalActiveMatched",
        header: "?",
        accessorKey: "matched",
        cell: (props) =>
          matched.find((s) => s.id === props.row.original.id) ? (
            <img
              src={activeCheck}
              alt={`Matched signal ${props.row.original.id} on this page`}
              title={`Matched signal ${props.row.original.id} on this page`}
              style={{ width: "16px" }}
            />
          ) : null,
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
    data:
      context?.signals?.computed.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      }) ?? [],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <AudiencesTable
      table={table}
      renderSubComponent={(row) => {
        const signal = row.original.id;
        const data = conditions.find(([id]) => id === signal)?.[1] || [];
        return <ConditionsTable row={row} data={data} context={context} />;
      }}
    />
  );
};
export default Signals;
