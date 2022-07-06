import { useEffect, useState } from "react";
import Papa from "papaparse";
import styled from "styled-components";

const allowedExtensions = ["csv"];

const App = () => {
  const [targetColumns, setTargetColumns] = useState([]);
  const [targetColumnName, setTargetColumnName] = useState("");
  const [csvFiles, setCsvFiles] = useState([
    { id: 0, name: "N/A", data: [], file: null, mappings: [], columns: [] },
  ]);
  const [targetCsv, setTargetCsv] = useState([]);
  // This state will store the parsed data
  const [data, setData] = useState([]);

  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = useState("");

  // It will store the file uploaded by the user
  const [file, setFile] = useState("");

  useEffect(() => {
    const newTargetCsv = { ...targetCsv, headers: targetColumns };

    setTargetCsv(newTargetCsv);
  }, [targetColumns]);

  useEffect(() => {
    console.log(csvFiles);
  }, [csvFiles]);
  // This function will be called when
  // the file input changes
  const handleFileChange = (event, index) => {
    setError("");

    // Check if user has entered the file
    if (event.target.files.length) {
      const inputFile = event.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }

      // If input type is correct set the state

      const newCsvFiles = csvFiles.map((csvFile) => {
        if (csvFile.id === index) {
          return { ...csvFile, name: inputFile.name, file: inputFile };
        }

        // 👇️ otherwise return object as is
        return csvFile;
      });

      setCsvFiles(newCsvFiles);
    }
  };
  const handleParse = (event, index) => {
    // If user clicks the parse button without
    // a file we show a error
    const file = csvFiles[index].file;
    if (!file) return setError("Enter a valid file");

    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader();

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      const columns = Object.keys(parsedData[0]);
      const newCsvFiles = csvFiles.map((csvFile) => {
        const mappings = [];
        for (let i = 0; i < columns.length; i++) {
          mappings.push("-");
        }
        if (csvFile.id === index) {
          return { ...csvFile, columns: columns, data: parsedData, mappings };
        }

        // 👇️ otherwise return object as is
        return csvFile;
      });

      setCsvFiles(newCsvFiles);
    };
    reader.readAsText(file);
  };

  const handleInputColumnNameChange = (event) => {
    setTargetColumnName(event.target.value);
  };

  const addTargetColumn = () => {
    setTargetColumns([...targetColumns, targetColumnName]);
    setTargetColumnName("");
  };

  const removeColumn = (event, index) => {
    setTargetColumns(targetColumns.filter((_, i) => i !== index));
  };

  const addCsvFile = () => {
    setCsvFiles([
      ...csvFiles,
      { id: csvFiles.length, name: "unnamed", file: null, columns: [] },
    ]);
  };

  const handleColumnMappings = (event, index, csvFileColumnIndex) => {
    const newCsvFiles = csvFiles.map((csvFile) => {
      const newMappings = csvFiles[index].mappings;
      newMappings[csvFileColumnIndex] = event.target.value;

      if (csvFile.id === index) {
        return { ...csvFile, mappings: newMappings };
      }
      // 👇️ otherwise return object as is
      return csvFile;
    });

    setCsvFiles(newCsvFiles);
  };

  useEffect(() => {
    console.log("***UPDATE TARGET***");
    for (let i; i++; i < csvFiles.length) {
      const data = {};
      for (let j = 0; j < csvFiles[i].columns.length; j++) {
        data[csvFiles[i].columns[j]] = csvFiles[i].mappings[j];
      }

      const newTargetCsv = { ...targetCsv, data: data };
      console.log(newTargetCsv);
      setTargetCsv(newTargetCsv);
    }
  }, [csvFiles]);

  return (
    <Container>
      <h1>CSV combiner</h1>
      <h2>CSV files</h2>
      <button onClick={addCsvFile}>add file</button>
      <CSVFiles>
        {csvFiles &&
          Array.isArray(csvFiles) &&
          csvFiles.length > 0 &&
          csvFiles.map((csvFile, index) => {
            return (
              <CSVFile key={index}>
                <label htmlFor="csvInput" style={{ display: "block" }}>
                  Enter CSV File
                </label>
                <input
                  onChange={(event) => handleFileChange(event, index)}
                  id="csvInput"
                  name="file"
                  type="File"
                />
                <div>
                  <button onClick={(event) => handleParse(event, index)}>
                    Parse
                  </button>
                </div>
                <div>
                  <h3>ID</h3>
                  {csvFiles[index].id}
                </div>
                <div>
                  <h3>File</h3>
                  {csvFiles[index].name}
                </div>
                <div style={{ marginTop: "3rem" }}>
                  <h3>Columns</h3>
                  <CSVTable>
                    <thead>
                      <tr>
                        <td>Columns</td>
                        {error
                          ? error
                          : csvFiles &&
                            Array.isArray(csvFiles) &&
                            csvFiles.length > 0 &&
                            csvFiles[index] &&
                            csvFiles[index].hasOwnProperty("columns") &&
                            csvFiles[index].columns.length > 0 &&
                            csvFiles[index].columns.map(
                              (csvFileColumn, csvFileColumnIndex) => (
                                <td key={csvFileColumnIndex}>
                                  {csvFileColumn}
                                </td>
                              )
                            )}
                      </tr>
                      <tr>
                        <td>Map to:</td>
                        {error
                          ? error
                          : csvFiles &&
                            Array.isArray(csvFiles) &&
                            csvFiles.length > 0 &&
                            csvFiles[index] &&
                            csvFiles[index].hasOwnProperty("columns") &&
                            csvFiles[index].columns.length > 0 &&
                            csvFiles[index].columns.map(
                              (_, csvFileColumnIndex) => (
                                <td key={csvFileColumnIndex}>
                                  <select
                                    onChange={(event) =>
                                      handleColumnMappings(
                                        event,
                                        index,
                                        csvFileColumnIndex
                                      )
                                    }
                                    value={
                                      csvFiles[index].mappings[
                                        csvFileColumnIndex
                                      ]
                                    }
                                  >
                                    <option>-</option>
                                    {targetColumns.map(
                                      (targetColumn, index) => {
                                        return (
                                          <option key={index}>
                                            {targetColumn}
                                          </option>
                                        );
                                      }
                                    )}
                                  </select>
                                </td>
                              )
                            )}
                      </tr>
                    </thead>
                    <tbody>
                      {error
                        ? error
                        : csvFiles &&
                          Array.isArray(csvFiles) &&
                          csvFiles.length > 0 &&
                          csvFiles[index] &&
                          csvFiles[index].hasOwnProperty("data") &&
                          csvFiles[index].data.length > 0 &&
                          csvFiles[index].data.slice(0, 2).map((row, idx) => (
                            <tr>
                              <td></td>
                              {Object.values(row).map((val, i) => (
                                <td>{val}</td>
                              ))}
                            </tr>
                          ))}
                    </tbody>
                  </CSVTable>
                </div>
              </CSVFile>
            );
          })}
      </CSVFiles>

      <div>
        <h2>Target Columns</h2>
        <CSVTable>
          <tbody>
            <tr>
              {targetColumns.map((targetColumn, index) => {
                return (
                  <td key={index}>
                    {targetColumn}
                    <button onClick={(event) => removeColumn(event, index)}>
                      remove
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </CSVTable>
        <input
          type="text"
          id="inputColumnName"
          onChange={handleInputColumnNameChange}
          value={targetColumnName}
          autoComplete="off"
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              addTargetColumn();
            }
          }}
        ></input>
        <button onClick={addTargetColumn}>Add column</button>
      </div>

      <div>
        <h2>Result</h2>
        <CSVTable>
          <thead>
            <tr>
              {targetCsv &&
                targetCsv.hasOwnProperty("headers") &&
                targetCsv.headers.length > 0 &&
                targetCsv.headers.map((header, i) => {
                  return <td>{header}</td>;
                })}
            </tr>
          </thead>
          <tbody>{console.log(targetCsv.data)}</tbody>
        </CSVTable>
      </div>
    </Container>
  );
};

export default App;

const CSVFiles = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const CSVFile = styled.div`
  background: white;
  padding: 12px;
  border-radius: 5px;
  box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.1);
  margin: 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 26px;
`;

const CSVTable = styled.table`
  border: 1px solid black;
  td {
    border: 1px solid black;
  }
`;
