import { ISignalAttributes, SignalValue } from "@contensis/experience-engine";
import { useExperienceEngineContext } from "@contensis/experience-engine-react";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  RowData,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    addRow: () => void;
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
  row: { index, original },
  column: { id },
  table,
}: CellContext<ReturnType<typeof formatSignals>[0], unknown>) => {
  const isKeyColumn = id === "0";
  const initialValue =
    typeof getValue() !== "undefined"
      ? getValue()
      : isKeyColumn
      ? "custom."
      : "";
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);
  const [isEditing, setEditing] = useState(isKeyColumn);
  const doSetAutoFocus = useRef<HTMLInputElement>(null);
  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    if (isKeyColumn && !value) {
      doSetAutoFocus.current?.focus();
    } else {
      table.options.meta?.updateData(index, id, value);
      setEditing(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isKeyColumn) sizeInput(e);
    setValue(e.target.value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return isEditing ? (
    <input
      autoFocus={isKeyColumn || (!isKeyColumn && original[0] !== undefined)}
      value={value as string}
      onFocus={(e) => {
        if (!isKeyColumn) sizeInput(e);
      }}
      onChange={onChange}
      onBlur={onBlur}
      onKeyUp={(e) => {
        if (e.key === "Enter") onBlur();
      }}
      ref={doSetAutoFocus}
    />
  ) : (
    <span onClick={() => setEditing(true)}>
      {`${value}`}
      {value ? null : "   "}
    </span>
  );
};
const FooterCell = ({ table }: { table: Table<[string, SignalValue]> }) => {
  const meta = table.options.meta;
  return (
    <div className="footer-buttons">
      <button className="add-button" onClick={meta?.addRow}>
        Add custom attribute
      </button>
    </div>
  );
};

const formatSignals = (snapshot?: ISignalAttributes) =>
  Object.entries(snapshot || {})
    .filter(([key]) => !key.endsWith("*"))
    .sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });

const Attributes = () => {
  const { context, overrideAttributes } = useExperienceEngineContext();

  const rerender = Object.values(context?.signals?.attributes || {}).join("+");

  const attributes = useMemo(() => {
    return context?.signals?.attributes;
  }, [rerender]);

  const snapshot = useMemo(() => {
    return context?.signals?.snapshot;
  }, [rerender]);

  const [signals, setSignals] = useState(formatSignals(attributes));

  const table = useReactTable({
    columns: [
      {
        header: "attribute",
        accessorKey: "0",
        cell: (props) => {
          const attributeKey = props.getValue();
          return typeof attributeKey !== "undefined" &&
            attributeKey !== "undefined" ? (
            <>{attributeKey}</>
          ) : (
            <EditableCell {...props} />
          );
        },
      },
      {
        header: "value",
        accessorKey: "1",
        cell: (props) => {
          const isRenderable = !["function", "object"].includes(
            typeof props.getValue()
          );
          const key = props.row.original[0];
          const value = snapshot?.[key as keyof ISignalAttributes];
          const originalValue =
            isRenderable && value != props.getValue() ? `${value}` : null;
          return (
            <>
              <code className={originalValue ? "override" : ""}>
                {isRenderable ? <EditableCell {...props} /> : null}
                {originalValue ? (
                  <button
                    className="override"
                    onClick={() => {
                      overrideAttributes({
                        [key]: undefined,
                      });
                    }}
                  >
                    x
                  </button>
                ) : null}
              </code>
              {originalValue && originalValue !== "undefined" ? (
                <code className="overridden">{originalValue}</code>
              ) : null}
            </>
          );
        },
      },
    ],
    data: signals,
    getCoreRowModel: getCoreRowModel(),
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        if (signals[rowIndex][1] != value) {
          console.log(
            `rowIndex, columnId, value, from`,
            rowIndex,
            columnId,
            value,
            signals[rowIndex]
          );
          if (columnId === "0")
            overrideAttributes({
              [value as string]: signals[rowIndex][1] as string,
            });
          else
            overrideAttributes({
              [signals[rowIndex][0]]: value as string,
            });
        }
      },
      addRow: () => {
        const newRow: any = [undefined, ""];
        setSignals((old: [string, any][]) => [...old, newRow]);
      },
    },
  });

  useEffect(() => {
    setSignals(formatSignals(attributes));
  }, [rerender, attributes]);

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
        <tr>
          <th colSpan={table.getCenterLeafColumns().length} align="right">
            <FooterCell table={table} />
          </th>
        </tr>
      </tfoot>
    </table>
  );
};
export default Attributes;
