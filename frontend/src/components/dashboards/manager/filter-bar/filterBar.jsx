

import { useState, useMemo } from "react";
import "./filterBar.css";

const FilterTable = ({ columns, data, onRowClick }) => {
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState(null);

  // =========================
  // FILTER HANDLERS
  // =========================
  const handleFilterChange = (key, value, type = "value") => {
    setFilters((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: value,
      },
    }));
  };

  // =========================
  // SORT HANDLER
  // =========================
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // =========================
  // FILTERED + SORTED DATA
  // =========================
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply filters
    columns.forEach((col) => {
      const f = filters[col.key];
      if (!f) return;

      if (col.filterType === "text" && f.value) {
        filtered = filtered.filter((row) =>
          String(row[col.key]).toLowerCase().includes(f.value.toLowerCase())
        );
      }

      if (col.filterType === "number") {
        if (f.min !== "" && f.min !== undefined) {
          filtered = filtered.filter((row) => Number(row[col.key]) >= Number(f.min));
        }
        if (f.max !== "" && f.max !== undefined) {
          filtered = filtered.filter((row) => Number(row[col.key]) <= Number(f.max));
        }
      }

      if (col.filterType === "date") {
        if (f.start) {
          filtered = filtered.filter((row) => new Date(row[col.key]) >= new Date(f.start));
        }
        if (f.end) {
          filtered = filtered.filter((row) => new Date(row[col.key]) <= new Date(f.end));
        }
      }
    });

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;

        let comparison = 0;

        // Number comparison
        if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        }
        // Date comparison
        else if (!isNaN(Date.parse(aVal)) && !isNaN(Date.parse(bVal))) {
          comparison = new Date(aVal) - new Date(bVal);
        }
        // Text comparison
        else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, filters, sortConfig, columns]);

  return (
    <div className="filter-table-container">
      <table className="filter-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={`header-${idx}`} onClick={() => handleSort(col.key)}>
                {col.label}{" "}
                {sortConfig?.key === col.key
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
            ))}
          </tr>
          <tr className="filter-row">
            {columns.map((col, idx) => (
              <th key={`filter-${idx}`}>
                {col.filterType === "text" && (
                  <input
                    type="text"
                    value={filters[col.key]?.value || ""}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                    placeholder="Filter..."
                  />
                )}

                {col.filterType === "number" && (
                  <div className="number-filter stacked-filter">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters[col.key]?.min || ""}
                      onChange={(e) => handleFilterChange(col.key, e.target.value, "min")}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters[col.key]?.max || ""}
                      onChange={(e) => handleFilterChange(col.key, e.target.value, "max")}
                    />
                  </div>
                )}

                {col.filterType === "date" && (
                  <div className="date-filter stacked-filter">
                    <input
                      type="date"
                      value={filters[col.key]?.start || ""}
                      onChange={(e) => handleFilterChange(col.key, e.target.value, "start")}
                    />
                    <input
                      type="date"
                      value={filters[col.key]?.end || ""}
                      onChange={(e) => handleFilterChange(col.key, e.target.value, "end")}
                    />
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row, idx) => (
              <tr key={`row-${row.id ?? idx}`} onClick={() => onRowClick(row)}>
                {columns.map((col, cidx) => (
                  <td key={`cell-${row.id ?? idx}-${cidx}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FilterTable;



