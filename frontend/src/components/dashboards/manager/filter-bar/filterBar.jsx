

import { useState, useMemo } from "react";

import "./filterBar.css";

const FilterTable = ({ columns, data, onRowClick }) => {
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return columns.every(col => {
        const filterVal = filters[col.key];
        if (!filterVal) return true;

        const cellVal = row[col.key];

        if (col.filterType === "number" && typeof cellVal === "number") {
          // Range filter: min-max
          const rangeMatch = filterVal.match(/^(\d+)?-?(\d+)?$/);
          if (rangeMatch) {
            const min = rangeMatch[1] ? parseFloat(rangeMatch[1]) : -Infinity;
            const max = rangeMatch[2] ? parseFloat(rangeMatch[2]) : Infinity;
            return cellVal >= min && cellVal <= max;
          }
          return cellVal === parseFloat(filterVal);
        }

        if (col.filterType === "date") {
          const filterDate = new Date(filterVal);
          const rowDate = new Date(cellVal);
          return rowDate.toDateString().includes(filterDate.toDateString());
        }

        return String(cellVal).toLowerCase().includes(filterVal.toLowerCase());
      });
    });
  }, [data, filters, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;

    return [...filteredData].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Parse numbers and dates for comparison
      if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (!isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  return (
    <div className="filter-table-container">
      <table className="filter-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} onClick={() => handleSort(col.key)}>
                {col.label} {sortConfig.key === col.key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
            ))}
          </tr>
          <tr>
            {columns.map(col => (
              <th key={`filter-${col.key}`}>
                {col.filterType === "text" && (
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters[col.key] || ""}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  />
                )}
                {col.filterType === "number" && (
                  <input
                    type="text"
                    placeholder="min-max"
                    value={filters[col.key] || ""}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  />
                )}
                {col.filterType === "date" && (
                  <input
                    type="date"
                    value={filters[col.key] || ""}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={`row-${row.id}`} onClick={() => onRowClick(row)}>
              {columns.map(col => (
                <td key={`cell-${row.id}-${col.key}`}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FilterTable;


