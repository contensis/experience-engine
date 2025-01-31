import { usePersonalizationContext } from "@contensis/personalization-react";
import { Store } from "@contensis/personalization";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import activeCheck from "../assets/green_checkmark.svg";
import ReactSwitch from "react-switch";

const store = new Store({ persist: true });

const Audiences = () => {
  const { context, isAudience, manifest, state } = usePersonalizationContext();
  const audiences = manifest?.audiences ?? [];
  const table = useReactTable({
    columns: [
      {
        id: "isAudienceActive",
        header: " ",
        accessorFn: ({ id }) => isAudience(id),
        cell: (props) => (
          <label title="Activate or deactivate this signal">
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
              checked={isAudience(props.row.original.id)}
            />
          </label>
        ),
      },
      {
        id: "isAudience",
        header: "*",
        accessorFn: ({ id }) => isAudience(id),
        cell: (props) =>
          isAudience(props.row.original.id) ? (
            <img
              src={activeCheck}
              alt={`Audience ${props.row.original.id} is active`}
              style={{ width: "16px" }}
            />
          ) : null,
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
        header: "Description",
        accessorKey: "description",
      },
    ],
    data: audiences,
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
export default Audiences;
