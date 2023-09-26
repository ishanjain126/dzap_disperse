import React, { useEffect, useState } from "react";
import "./Disperse.css";

const Disperse: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string[]>([]);
  const [showExample, setShowExample] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (error.length > 0) {
      setError([]);
    }
  };
  const validateEntries = (): string[] => {
    const errors: string[] = [];
    const lines = text.split("\n");
    const addressSet = new Set<string>();
    const addressLines: { [address: string]: number[] } = {};

    lines.forEach((line, index) => {
      const parts = line.split(/[\s,=]/);
      if (parts.length >= 2) {
        const address = parts[0];
        const amount = parts[1];

        if (!address.startsWith("0x") || address.length !== 42) {
          errors.push(`Line ${index + 1}: invalid Ethereum address.`);
        }

        if (!/^\d+(\.\d+)?$/.test(amount) || isNaN(parseFloat(amount))) {
          errors.push(`Line ${index + 1}: wrong amount.`);
        }

        if (addressSet.has(address)) {
          if (addressLines[address]) {
            addressLines[address].push(index + 1);
          } else {
            addressLines[address] = [index + 1];
          }
        } else {
          addressSet.add(address);
          addressLines[address] = [index + 1];
        }
      } else {
        errors.push(`Line ${index + 1}: Invalid format.`);
      }
    });

    // Generating error messages for duplicates
    for (const address in addressLines) {
      if (addressLines[address].length > 1) {
        errors.push(
          `${address} duplicate in line: ${addressLines[address].join(", ")}.`
        );
      }
    }

    return errors;
  };

  const onSubmit = () => {
    const newErrors = validateEntries();
    setError(newErrors);
  };

  const keepFirstOccurrence = () => {
    const lines = text.split("\n");
    const addressSet = new Set<string>();
    const updatedLines: string[] = [];

    lines.forEach((line) => {
      const parts = line.split(/[\s,=]/);
      if (parts.length >= 2) {
        const address = parts[0];
        if (!addressSet.has(address)) {
          addressSet.add(address);
          updatedLines.push(line);
        }
      }
    });

    setText(updatedLines.join("\n"));
    const filteredErrors = error.filter(
      (err) => !err.includes("Duplicate Ethereum address.")
    );
    setError(filteredErrors);
  };

  const mergeAmounts = () => {
    const lines = text.split("\n");
    const addressAmounts: { [address: string]: number } = {};

    lines.forEach((line) => {
      const parts = line.split(/[\s,=]/);
      if (parts.length >= 2) {
        const address = parts[0];
        const amount = parseFloat(parts[1]);
        if (addressAmounts[address]) {
          addressAmounts[address] += amount;
        } else {
          addressAmounts[address] = amount;
        }
      }
    });

    const mergedLines = Object.entries(addressAmounts).map(
      ([address, amount]) => `${address}=${amount}`
    );

    setText(mergedLines.join("\n"));
    const filteredErrors = error.filter(
      (err) => !err.includes("Duplicate Ethereum address.")
    );
    setError(filteredErrors);
  };

  return (
    <div className="disperse-container">
      <div className="header">
        <div className="header-1">Addresses with amount</div>
        <div className="upload-file-btn">Upload file</div>
      </div>
      <div className="disperse-input">
        <div className="line-numbers">
          {text
            .split("\n")
            .map((_, index) => index + 1)
            .join("\n")}
        </div>
        <div className="separator"></div>
        <textarea
          className="editable-content"
          value={text}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="helper-text-container">
        <div className="helper-text-1">Separated by ',' or ' ' or '='</div>
        <div
          className="show-example-btn"
          onClick={() => setShowExample((prev) => !prev)}
        >
          Show Example
        </div>
      </div>
      {showExample && (
        <div className="example">
          0x2CB99F193549681e06C6770dDD5543812B4FaFE8=1 <br />
          0x8B3392483BA26D65E331dB86D4F430E9B3814E5e 50 <br />
          0x09ae5A64465c18718a46b3aD946270BD3E5e6aaB,13 <br />
        </div>
      )}

      {/* Duplicate errors container */}
      {error.some((err) => err.includes("Duplicate address")) && (
        <div className="duplicate-errors-container">
          <div className="keep-only-one-btn" onClick={keepFirstOccurrence}>
            Keep the first one
          </div>
          <div className="duplicate-separator"></div>
          <div className="merge-amount-btn" onClick={mergeAmounts}>
            Combine Balance
          </div>
        </div>
      )}

      {/* Display error messages */}
      {error.length > 0 && (
        <div className="error-message">
          <div className="error-icon">{"!"}</div>
          <div>
            {error.map((errMsg, index) => (
              <div key={index}>{errMsg}</div>
            ))}
          </div>
        </div>
      )}

      <button
        className={error.length > 0 ? "next-btn-err" : "next-btn"}
        onClick={onSubmit}
      >
        Next
      </button>
    </div>
  );
};

export default Disperse;
