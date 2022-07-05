import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import Papa from "papaparse";
import styled from "styled-components";

const allowedExtensions = ["csv"];

const App = () => {
  const [targetColumns, setTargetColumns] = useState([]);
  const [targetColumnName, setTargetColumnName] = useState("");
  const [csvFiles, setCsvFiles] = useState([]);
  // This state will store the parsed data
  const [data, setData] = useState([]);

  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = useState("");

  // It will store the file uploaded by the user
  const [file, setFile] = useState("");

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
        return csvFiles;
      });

      console.log(newCsvFiles);

      setCsvFiles(newCsvFiles);
    }
  };
  const handleParse = (event, index) => {
    // If user clicks the parse button without
    // a file we show a error
    const file = csvFiles[index].file;
    console.log("******FILE********");
    console.log(csvFiles[index]);
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
      const newCsvFiles = csvFiles.map((obj) => {
        if (obj.id === index) {
          return { ...obj, columns: columns };
        }

        // 👇️ otherwise return object as is
        return obj;
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

  return (
    <Container>
      {console.log(csvFiles)}
      <h1>CSV files</h1>
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
                <div style={{ marginTop: "3rem" }}>
                  {error
                    ? error
                    : csvFiles &&
                      Array.isArray(csvFiles) &&
                      csvFiles.length > 0 &&
                      csvFiles[index] &&
                      csvFiles[index].hasOwnProperty("columns") &&
                      csvFiles[index].columns.length > 0 &&
                      csvFiles[index].columns.map((col, idx) => (
                        <div key={idx}>{col}</div>
                      ))}
                </div>
              </CSVFile>
            );
          })}
      </CSVFiles>

      <div>
        <h2>Target Columns</h2>
        <ul>
          {targetColumns.map((targetColumn, index) => {
            return (
              <li key={index}>
                {targetColumn}
                <button onClick={(event) => removeColumn(event, index)}>
                  remove
                </button>
              </li>
            );
          })}
        </ul>
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
  max-width: 300px;
  margin: 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 26px;
`;
