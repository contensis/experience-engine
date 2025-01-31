import { flexRender, Row, Table } from "@tanstack/react-table";
import { Fragment } from "react";

const AudiencesTable = <T,>({
  table,
  renderSubComponent,
}: {
  renderSubComponent?: (row: Row<T>) => JSX.Element;
  table: Table<T>;
}) => {
  if (table.getRowCount() === 0) return null;
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={
                  header.column.columnDef.meta &&
                  "className" in header.column.columnDef.meta
                    ? (header.column.columnDef.meta?.className as string)
                    : ""
                }
              >
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
          <Fragment key={row.id}>
            <tr>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
            {row.getIsExpanded() && renderSubComponent && (
              <tr>
                {/* 2nd row is a custom 1 cell row */}
                <td colSpan={row.getVisibleCells().length} className="sub">
                  {renderSubComponent(row)}
                </td>
              </tr>
            )}
          </Fragment>
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

export default AudiencesTable;
