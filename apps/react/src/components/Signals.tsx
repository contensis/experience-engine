import { usePersonalizationContext } from "@contensis/personalization-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import activeCheck from "../assets/green_checkmark.svg";
import ReactSwitch from "react-switch";
import { Store } from "@contensis/personalization";

const store = new Store({ persist: true });

const Signals = () => {
  const { context, manifest, matched, signals, state } =
    usePersonalizationContext();

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
                  store.set(state);

                  // // Trigger a new pageView in the context to force signal and audience recalculation
                  // context.pageView();

                  // Hack the context by setting the CalculatedSignals to null
                  // in the pageViews array for this (last) route/pageView
                  // and then manually call the compute method
                  context.pageViews[context.pageViews.length - 1][2] = null;
                  context.compute();
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
    ],
    data: context?.signals?.computed ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        {table.getFooterGroups().map((footerGroup) => (
          <tr key={footerGroup.id}>
            {footerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  );
};
export default Signals;
