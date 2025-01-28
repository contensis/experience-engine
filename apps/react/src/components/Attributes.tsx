import { ISignalAttributes } from "@contensis/personalization";
import { usePersonalizationContext } from "@contensis/personalization-react";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}
const sizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const target = e.target;
  target.style.width = "60px";
  target.style.width = `${target.scrollWidth}px`;
};

const EditableCell = ({
  getValue,
  row: { index },
  column: { id },
  table,
}: CellContext<ReturnType<typeof formatSignals>[0], unknown>) => {
  const initialValue = typeof getValue() !== "undefined" ? getValue() : "";
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);
  const [isEditing, setEditing] = useState(false);

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateData(index, id, value);
    setEditing(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sizeInput(e);
    setValue(e.target.value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return isEditing ? (
    <input
      autoFocus
      value={value as string}
      onFocus={(e) => {
        sizeInput(e);
      }}
      onChange={onChange}
      onBlur={onBlur}
      onKeyUp={(e) => {
        if (e.key === "Enter") onBlur();
      }}
    />
  ) : (
    <span onClick={() => setEditing(true)}>{`${value}`}</span>
  );
};

const formatSignals = (snapshot?: ISignalAttributes) =>
  Object.entries(snapshot || {}).sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });

const Attributes = () => {
  const { context, setSignals: setAttribute } = usePersonalizationContext();

  const [signals, setSignals] = useState(
    formatSignals(context?.signals?.snapshot)
  );

  const rerender = Object.values(context?.signals?.snapshot || {}).join("+");

  const table = useReactTable({
    columns: [
      {
        header: "attribute",
        accessorKey: "0",
      },
      {
        header: "value",
        accessorKey: "1",
        cell: (props) => (
          <code>
            {["string", "number", "boolean"].includes(
              typeof props.getValue()
            ) ? (
              <EditableCell {...props} />
            ) : null}
          </code>
        ),
      },
    ],
    data: signals,
    getCoreRowModel: getCoreRowModel(),
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        console.log(`rowIndex, columnId, value`, rowIndex, columnId, value);

        setAttribute({
          [signals[rowIndex][0]]: value as string,
        });
      },
    },
  });

  useEffect(() => {
    setSignals(formatSignals(context?.signals?.snapshot));
  }, [rerender, context?.signals?.snapshot]);

  return (
    <table>
      <colgroup>
        <col className="title-column" />
        <col />
      </colgroup>
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
              <td
                key={cell.id}
                className={
                  cell.column.columnDef.header === "attribute"
                    ? "title-column"
                    : ""
                }
              >
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
export default Attributes;
