import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useRef,
} from "react";
import { useToast } from "../Providers/ToastProvider";
import "../assets/Navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const DataContext = createContext();
export const useTable = () => useContext(DataContext);

export const TableProvider = ({ children, initialData = [], endPoint }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const transformedData = initialData.map((row, index) => ({
      id: index,
      isEditing: false,
      ...row,
    }));
    setTableData(transformedData);
  }, [initialData]);

  const toggleEditMode = async (id) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, isEditing: !row.isEditing } : row
      )
    );

    console.log("id." + id);
  };

  const handleChange = (id, field, value) => {
    setTableData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const updateData = async (row) => {
    const fakeResponse = {
      ok: false,
      status: 400, // Or any other non-2xx status code
      statusText: "Bad Request",
      json: async () => ({ message: "Simulated server error" }), // Simulate a JSON response body
      text: async () => "Simulated server error", //simulating a text response.
    };
    return fakeResponse;
  };

  return (
    <DataContext.Provider
      value={{ tableData, toggleEditMode, handleChange, updateData }}
    >
      {children}
    </DataContext.Provider>
  );
};

const styles = {
  disabled: {
    border: "none",
    background: "transparent",
    width: "100%",
    padding: "5px",
    fontSize: "inherit",
    color: "inherit",
    outline: "none",
  },
  enabled: {
    border: "1px solid #007bff",
    background: "transparent",
    width: "100%",
    padding: "5px",
    fontSize: "inherit",
    color: "inherit",
    outline: "none",
    borderRadius: "6px",
    transition: "border 0.3s ease, background 0.3s ease",
  },
};

const TextCell = ({ value, onChange, isEditing }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    style={isEditing ? styles.enabled : styles.disabled}
    disabled={!isEditing}
  />
);

const CheckboxCell = ({ value, onChange, isEditing }) => (
  <input
    type="checkbox"
    checked={value}
    onChange={onChange}
    disabled={!isEditing}
    style={isEditing ? styles.enabled : styles.disabled}
  />
);

const SelectCell = ({ value, options, onChange, isEditing }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={!isEditing}
    style={isEditing ? styles.enabled : styles.disabled}
  >
    {options.map((option, index) => (
      <option key={index} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const Cell = ({ row, header }) => {
  const { handleChange } = useTable();

  const handleCellChange = (e) => {
    const value =
      header.type === "checkbox" ? e.target.checked : e.target.value;
    handleChange(row.id, header.field, value);
  };

  switch (header.type) {
    case "text":
      return (
        <td>
          <TextCell
            value={row[header.field]}
            onChange={handleCellChange}
            isEditing={row.isEditing}
          />
        </td>
      );
    case "checkbox":
      return (
        <td>
          <CheckboxCell
            value={row[header.field]}
            onChange={handleCellChange}
            isEditing={row.isEditing}
          />
        </td>
      );
    case "select":
      return (
        <td>
          <SelectCell
            value={row[header.field]}
            options={header.options}
            onChange={handleCellChange}
            isEditing={row.isEditing}
          />
        </td>
      );
    default:
      return <td>{row[header.field]}</td>;
  }
};

const Row = ({ row, headers }) => {
  const { tableData, toggleEditMode, updateData } = useTable();
  const { addToast } = useToast();

  const handleSave = async (id) => {
    const rowToSave = tableData.find((rx) => rx.id == id);
    console.log("Saving data:", rowToSave);

    const response = await updateData(rowToSave);

    if (response.ok) {
      toggleEditMode(row.id);
    } else {
      const data = await response.json();
      addToast("failed!", "danger");
    }
  };

  console.log("row" + row.id);

  return (
    <tr className="align-middle">
      {headers.map((header, index) => (
        <Cell key={index} row={row} header={header} />
      ))}
      <td style={{ width: "150px" }}>
        {row.isEditing ? (
          <>
            <i
              key={`save-${row.id}`} // Unique key for the save icon
              className="fas fa-check me-3 text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => handleSave(row.id)}
            />
            <i
              key={`cancel-${row.id}`} // Unique key for the cancel icon
              className="fas fa-times text-danger"
              style={{ cursor: "pointer" }}
              onClick={() => toggleEditMode(row.id)}
            />
          </>
        ) : (
          <>
            <i
              key={`edit-${row.id}`} // Unique key for the edit icon
              className="fas fa-pen me-3 text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => toggleEditMode(row.id)}
            />
            <i
              key={`delete-${row.id}`} // Unique key for the delete icon
              className="fas fa-trash-alt text-danger"
              style={{ cursor: "pointer" }}
            />
          </>
        )}
      </td>
    </tr>
  );
};

export const Table = ({ headers }) => {
  const { tableData } = useTable();

  return (
    <div
      className="container d-flex table-responsive"
      style={{ marginTop: "70px" }}
    >
      <table className="table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header.name}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <Row key={row.id} row={row} headers={headers} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ATable = () => {
  const initialData = [
    { id: 1, name: "John Doe", age: 28, city: "New York", active: true },
    { id: 2, name: "Jane Smith", age: 32, city: "Los Angeles", active: false },
  ];

  const cities = ["New York", "Los Angeles", "Chicago", "San Francisco"];
  const headerData = [
    { field: "name", name: "Full Name", type: "text" },
    { field: "age", name: "Age", type: "text" },
    { field: "city", name: "City", type: "select", options: cities },
    { field: "active", name: "Status", type: "checkbox" },
  ];

  return (
    <TableProvider
      initialData={initialData}
      endPoint="/api/v1/dictionary/updatex"
    >
      <Table headers={headerData} />
    </TableProvider>
  );
};
