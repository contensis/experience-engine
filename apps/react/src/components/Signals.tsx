import { usePersonalizationContext } from "@contensis/personalization-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import activeCheck from "../assets/green_checkmark.svg";

const Signals = () => {
  const { context, matched, signals } = usePersonalizationContext();

  const table = useReactTable({
    columns: [
      {
        id: "isSignalActive",
        header: "*",
        accessorFn: ({ id }) => signals.includes(id),
        cell: (props) =>
          signals.includes(props.row.original.id) ? (
            <img
              src={activeCheck}
              alt={`Signal ${props.row.original.id} is active`}
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
          <div style={{ textAlign: "right" }}>{props.getValue()}</div>
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
