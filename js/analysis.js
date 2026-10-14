
"use strict";

/* =====================================================
   MyNominee.In — Dataset Analysis Workspace
   File: js/analysis.js

   Features:
   - CSV, XLS, XLSX file uploads
   - Drag and drop
   - Dataset preview
   - Column type detection
   - Missing-value analysis
   - Statistical test selection
   - Backend-ready test execution
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initializeAnalysisWorkspace();
});

function initializeAnalysisWorkspace() {
  const elements = {
    dropZone: document.getElementById("dropZone"),
    fileInput: document.getElementById("datasetFile"),
    browseButton: document.getElementById("browseButton"),
    uploadStatus: document.getElementById("uploadStatus"),
    selectedFile: document.getElementById("selectedFile"),
    fileName: document.getElementById("fileName"),
    fileSize: document.getElementById("fileSize"),
    removeFile: document.getElementById("removeFile"),
    analyzeButton: document.getElementById("analyzeButton"),
    resetButton: document.getElementById("resetButton"),

    datasetOverview: document.getElementById("datasetOverview"),
    datasetDescription: document.getElementById("datasetDescription"),
    rowCount: document.getElementById("rowCount"),
    columnCount: document.getElementById("columnCount"),
    missingCount: document.getElementById("missingCount"),
    datasetSize: document.getElementById("datasetSize"),

    columnSummaryBody: document.getElementById("columnSummaryBody"),
    previewTableHead: document.getElementById("previewTableHead"),
    previewTableBody: document.getElementById("previewTableBody"),
    previewNote: document.getElementById("previewNote"),

    testCategory: document.getElementById("testCategory"),
    statisticalTest: document.getElementById("statisticalTest"),
    variableOne: document.getElementById("variableOne"),
    variableTwo: document.getElementById("variableTwo"),
    runTestButton: document.getElementById("runTestButton"),
    testStatus: document.getElementById("testStatus"),
    testResults: document.getElementById("testResults"),
    testResultsContent: document.getElementById("testResultsContent")
  };

  let selectedFile = null;
  let dataset = null;
  let columnMetadata = [];

  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const MAX_PREVIEW_ROWS = 10;
  const MAX_PREVIEW_COLUMNS = 30;
  const MAX_COLUMNS = 500;
  const MAX_ROWS = 250000;

  const testOptions = {
    means: [
      { value: "one_sample_t", label: "One-sample t-test" },
      { value: "independent_t", label: "Independent samples t-test" },
      { value: "paired_t", label: "Paired samples t-test" },
      { value: "welch_anova", label: "Welch's ANOVA" },
      { value: "anova", label: "One-way ANOVA" }
    ],

    nonparametric: [
      { value: "mann_whitney", label: "Mann–Whitney U test" },
      { value: "wilcoxon", label: "Wilcoxon signed-rank test" },
      { value: "kruskal", label: "Kruskal–Wallis test" }
    ],

    correlation: [
      { value: "pearson", label: "Pearson correlation" },
      { value: "spearman", label: "Spearman correlation" },
      { value: "point_biserial", label: "Point-biserial correlation" }
    ],

    categorical: [
      { value: "chi_square", label: "Chi-square test of independence" },
      { value: "fisher_exact", label: "Fisher's exact test" }
    ],

    regression: [
      { value: "linear_regression", label: "Linear regression" }
    ]
  };

  /* ---------- Event listeners ---------- */

  if (!elements.dropZone || !elements.fileInput) {
    console.error(
      "Analysis workspace elements are missing. Check analysis.html."
    );
    return;
  }

  elements.browseButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    elements.fileInput.click();
  });

  elements.dropZone.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    elements.fileInput.click();
  });

  elements.dropZone.addEventListener("keydown", (event) => {
    if (event.target !== elements.dropZone) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput.click();
    }
  });

  elements.fileInput.addEventListener("change", () => {
    const file = elements.fileInput.files?.[0];
    if (file) handleFileSelection(file);
  });

  elements.dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropZone.classList.add("drag-over");
  });

  elements.dropZone.addEventListener("dragleave", (event) => {
    if (!elements.dropZone.contains(event.relatedTarget)) {
      elements.dropZone.classList.remove("drag-over");
    }
  });

  elements.dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("drag-over");

    const file = event.dataTransfer?.files?.[0];

    if (file) handleFileSelection(file);
  });

  elements.removeFile?.addEventListener("click", resetWorkspace);
  elements.resetButton?.addEventListener("click", resetWorkspace);

  elements.analyzeButton?.addEventListener("click", inspectDataset);

  elements.testCategory?.addEventListener("change", updateTestOptions);
  elements.statisticalTest?.addEventListener("change", updateTestButton);
  elements.variableOne?.addEventListener("change", updateTestButton);
  elements.variableTwo?.addEventListener("change", updateTestButton);

  elements.runTestButton?.addEventListener("click", runStatisticalTest);

  /* ---------- File selection ---------- */

  function handleFileSelection(file) {
    clearUploadStatus();

    const extension = getExtension(file.name);
    const supportedExtensions = ["csv", "xls", "xlsx"];

    if (!supportedExtensions.includes(extension)) {
      showUploadStatus(
        "Unsupported file type. Please select a CSV, XLS, or XLSX file.",
        "error"
      );
      return;
    }

    if (file.size === 0) {
      showUploadStatus("The selected file is empty.", "error");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showUploadStatus(
        "The file exceeds the 20 MB limit. Please choose a smaller file.",
        "error"
      );
      return;
    }

    if (extension !== "csv" && typeof XLSX === "undefined") {
      showUploadStatus(
        "The Excel parser did not load. Check your internet connection and reload the page.",
        "error"
      );
      return;
    }

    selectedFile = file;
    dataset = null;
    columnMetadata = [];

    elements.selectedFile?.classList.remove("d-none");

    if (elements.fileName) {
      elements.fileName.textContent = file.name;
    }

    if (elements.fileSize) {
      elements.fileSize.textContent = formatFileSize(file.size);
    }

    if (elements.analyzeButton) {
      elements.analyzeButton.disabled = false;
    }

    elements.datasetOverview?.classList.add("d-none");

    clearTestState();

    showUploadStatus(
      "File selected successfully. Click Inspect Dataset to preview and validate it.",
      "success"
    );
  }

  /* ---------- Inspect uploaded dataset ---------- */

  async function inspectDataset() {
    if (!selectedFile) {
      showUploadStatus("Please select a dataset first.", "error");
      return;
    }

    const fileAtStart = selectedFile;

    elements.analyzeButton.disabled = true;
    elements.analyzeButton.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Inspecting dataset...';

    showUploadStatus("Reading and validating your dataset...", "info");

    try {
      const parsed = await parseFile(fileAtStart);

      // Ignore stale results if the user changed the selected file.
      if (selectedFile !== fileAtStart) return;

      if (!Array.isArray(parsed.headers) || parsed.headers.length === 0) {
        throw new Error(
          "No column headers were found. Check the first row of your dataset."
        );
      }

      if (parsed.headers.length > MAX_COLUMNS) {
        throw new Error(
          `This dataset contains more than ${MAX_COLUMNS} columns. Please reduce the number of columns.`
        );
      }

      if (parsed.rows.length > MAX_ROWS) {
        throw new Error(
          `This dataset contains more than ${MAX_ROWS.toLocaleString()} rows. Please use a smaller dataset.`
        );
      }

      const normalized = normalizeDataset(parsed);

      if (normalized.rows.length === 0) {
        throw new Error("The dataset contains no data rows.");
      }

      dataset = normalized;
      columnMetadata = buildColumnMetadata(dataset);

      renderOverview();
      renderColumnSummary();
      renderPreview();
      populateVariableSelectors();

      elements.datasetOverview?.classList.remove("d-none");

      showUploadStatus(
        "Dataset inspected successfully. Review the summary before continuing.",
        "success"
      );

      elements.datasetOverview?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    } catch (error) {
      console.error("Dataset inspection failed:", error);

      dataset = null;
      columnMetadata = [];

      elements.datasetOverview?.classList.add("d-none");

      showUploadStatus(
        error instanceof Error
          ? error.message
          : "Unable to inspect this dataset.",
        "error"
      );

    } finally {
      elements.analyzeButton.disabled = !selectedFile;
      elements.analyzeButton.innerHTML =
        '<i class="bi bi-bar-chart-line me-2"></i>Inspect Dataset';
    }
  }

  /* ---------- Parse CSV and Excel ---------- */

  async function parseFile(file) {
    const extension = getExtension(file.name);

    if (extension === "csv") {
      const text = await readTextFile(file);
      return parseCSV(text);
    }

    if (typeof XLSX === "undefined") {
      throw new Error("The Excel parser is unavailable.");
    }

    const buffer = await readArrayBuffer(file);

    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true
    });

    if (!workbook.SheetNames.length) {
      throw new Error("The workbook contains no worksheets.");
    }

    // Use the first worksheet by default.
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    const matrix = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      defval: null,
      raw: true,
      blankrows: false
    });

    if (!matrix.length) {
      throw new Error("The first worksheet is empty.");
    }

    const headers = matrix[0].map((value, index) => {
      const text = value == null ? "" : String(value).trim();
      return text || `Column ${index + 1}`;
    });

    const rows = matrix.slice(1).map((row) =>
      headers.map((_, index) => row[index] ?? null)
    );

    return {
      headers,
      rows,
      worksheetName: workbook.SheetNames[0]
    };
  }

  function readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Unable to read the CSV file."));

      reader.readAsText(file);
    });
  }

  function readArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read the Excel file."));

      reader.readAsArrayBuffer(file);
    });
  }

  /* ---------- CSV parser ---------- */

  function parseCSV(text) {
    if (!text || !text.trim()) {
      throw new Error("The CSV file is empty.");
    }

    // Remove a UTF-8 byte-order mark if present.
    text = text.replace(/^\uFEFF/, "");

    const firstLine = text.split(/\r\n|\n|\r/, 1)[0] ?? "";

    const delimiter = detectDelimiter(firstLine);
    const matrix = [];
    let row = [];
    let field = "";
    let insideQuotes = false;

    for (let index = 0; index < text.length; index++) {
      const character = text[index];

      if (insideQuotes) {
        if (character === '"') {
          if (text[index + 1] === '"') {
            field += '"';
            index++;
          } else {
            insideQuotes = false;
          }
        } else {
          field += character;
        }

        continue;
      }

      if (character === '"' && field.length === 0) {
        insideQuotes = true;
      } else if (character === delimiter) {
        row.push(field);
        field = "";
      } else if (character === "\n" || character === "\r") {
        row.push(field);

        if (row.some((cell) => String(cell).trim() !== "")) {
          matrix.push(row);
        }

        row = [];
        field = "";

        // Treat CRLF as one newline.
        if (character === "\r" && text[index + 1] === "\n") {
          index++;
        }
      } else {
        field += character;
      }
    }

    if (insideQuotes) {
      throw new Error(
        "The CSV contains an unclosed quoted field. Check the file formatting."
      );
    }

    row.push(field);

    if (row.some((cell) => String(cell).trim() !== "")) {
      matrix.push(row);
    }

    if (!matrix.length) {
      throw new Error("No data was found in the CSV file.");
    }

    const rawHeaders = matrix[0];

    const headers = rawHeaders.map((value, index) => {
      const name = String(value ?? "").trim();
      return name || `Column ${index + 1}`;
    });

    const rows = matrix.slice(1).map((record) =>
      headers.map((_, index) => record[index] ?? null)
    );

    return { headers, rows };
  }

  function detectDelimiter(line) {
    const delimiters = [",", ";", "\t", "|"];

    let bestDelimiter = ",";
    let bestCount = -1;

    for (const delimiter of delimiters) {
      let count = 0;
      let insideQuotes = false;

      for (let index = 0; index < line.length; index++) {
        const character = line[index];

        if (character === '"') {
          if (insideQuotes && line[index + 1] === '"') {
            index++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (character === delimiter && !insideQuotes) {
          count++;
        }
      }

      if (count > bestCount) {
        bestCount = count;
        bestDelimiter = delimiter;
      }
    }

    return bestDelimiter;
  }

  /* ---------- Normalize dataset ---------- */

  function normalizeDataset(parsed) {
    const originalHeaders = parsed.headers.map((header) =>
      String(header).trim()
    );

    // Preserve duplicate column names internally without losing columns.
    const usedNames = new Map();

    const headers = originalHeaders.map((header, index) => {
      const baseName = header || `Column ${index + 1}`;
      const count = usedNames.get(baseName) ?? 0;

      usedNames.set(baseName, count + 1);

      return count === 0 ? baseName : `${baseName} (${count + 1})`;
    });

    const rows = parsed.rows
      .map((row) => headers.map((_, index) => normalizeCell(row[index])))
      .filter((row) => row.some((value) => !isMissing(value)));

    return {
      headers,
      rows,
      worksheetName: parsed.worksheetName ?? null,
      originalRowCount: parsed.rows.length
    };
  }

  function normalizeCell(value) {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value.toISOString();
    }

    if (value === undefined || value === null) return null;

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) return null;

      // Treat common missing-value markers as missing.
      if (/^(na|n\/a|null|undefined|nan)$/i.test(trimmed)) {
        return null;
      }

      return trimmed;
    }

    return value;
  }

  function isMissing(value) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "number" && !Number.isFinite(value))
    );
  }

  /* ---------- Column type detection ---------- */

  function buildColumnMetadata(data) {
    return data.headers.map((name, index) => {
      const values = data.rows.map((row) => row[index]);
      const presentValues = values.filter((value) => !isMissing(value));

      const missing = values.length - presentValues.length;
      const type = inferColumnType(presentValues);

      return {
        name,
        index,
        type,
        total: values.length,
        nonMissing: presentValues.length,
        missing,
        uniqueCount: new Set(presentValues.map(String)).size
      };
    });
  }

  function inferColumnType(values) {
    if (values.length === 0) return "Empty";

    if (values.every((value) => typeof value === "boolean")) {
      return "Boolean";
    }

    if (values.every(isNumericValue)) {
      return "Numeric";
    }

    if (values.every(isDateLike)) {
      return "Date / Time";
    }

    if (values.every((value) =>
      typeof value === "string" &&
      /^(true|false|yes|no)$/i.test(value.trim())
    )) {
      return "Boolean-like";
    }

    return "Categorical / Text";
  }

  function isNumericValue(value) {
    if (typeof value === "number") {
      return Number.isFinite(value);
    }

    if (typeof value !== "string" || value.trim() === "") {
      return false;
    }

    return Number.isFinite(Number(value));
  }

  function isDateLike(value) {
    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }

    if (typeof value !== "string") return false;

    const text = value.trim();

    // Require recognizable date notation to avoid classifying
    // arbitrary numbers such as 2024 as dates.
    const looksLikeDate =
      /^\d{4}[-/]\d{1,2}[-/]\d{1,4}/.test(text) ||
      /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(text) ||
      /^\d{4}-\d{2}-\d{2}T/.test(text);

    return looksLikeDate && !Number.isNaN(Date.parse(text));
  }

  /* ---------- Render overview ---------- */

  function renderOverview() {
    const rows = dataset.rows.length;
    const columns = dataset.headers.length;

    const missing = columnMetadata.reduce(
      (sum, column) => sum + column.missing,
      0
    );

    if (elements.rowCount) {
      elements.rowCount.textContent = rows.toLocaleString();
    }

    if (elements.columnCount) {
      elements.columnCount.textContent = columns.toLocaleString();
    }

    if (elements.missingCount) {
      elements.missingCount.textContent = missing.toLocaleString();
    }

    if (elements.datasetSize && selectedFile) {
      elements.datasetSize.textContent = formatFileSize(selectedFile.size);
    }

    if (elements.datasetDescription) {
      const worksheet = dataset.worksheetName
        ? ` · Worksheet: ${dataset.worksheetName}`
        : "";

      elements.datasetDescription.textContent =
        `${selectedFile.name} · ${rows.toLocaleString()} rows · ` +
        `${columns.toLocaleString()} columns${worksheet}`;
    }
  }

  /* ---------- Render column summary ---------- */

  function renderColumnSummary() {
    const tbody = elements.columnSummaryBody;

    if (!tbody) return;

    tbody.replaceChildren();

    columnMetadata.forEach((column) => {
      const tr = document.createElement("tr");

      appendTextCell(tr, column.name);

      const typeCell = document.createElement("td");
      const typeBadge = document.createElement("span");

      typeBadge.className = "type-badge";
      typeBadge.textContent = column.type;

      typeCell.appendChild(typeBadge);
      tr.appendChild(typeCell);

      appendTextCell(tr, column.nonMissing.toLocaleString());

      const missingCell = document.createElement("td");

      if (column.missing > 0) {
        const badge = document.createElement("span");
        badge.className = "missing-badge";
        badge.textContent = column.missing.toLocaleString();
        missingCell.appendChild(badge);
      } else {
        missingCell.textContent = "0";
      }

      tr.appendChild(missingCell);
      tbody.appendChild(tr);
    });
  }

  /* ---------- Render data preview ---------- */

  function renderPreview() {
    const thead = elements.previewTableHead;
    const tbody = elements.previewTableBody;

    if (!thead || !tbody) return;

    thead.replaceChildren();
    tbody.replaceChildren();

    const visibleHeaders = dataset.headers.slice(0, MAX_PREVIEW_COLUMNS);

    const headerRow = document.createElement("tr");

    visibleHeaders.forEach((header) => {
      appendTextCell(headerRow, header, "th");
    });

    thead.appendChild(headerRow);

    const visibleRows = dataset.rows.slice(0, MAX_PREVIEW_ROWS);

    visibleRows.forEach((row) => {
      const tr = document.createElement("tr");

      visibleHeaders.forEach((_, index) => {
        const value = row[index];
        appendTextCell(tr, isMissing(value) ? "—" : String(value));
      });

      tbody.appendChild(tr);
    });

    if (elements.previewNote) {
      const extraRows = dataset.rows.length - visibleRows.length;
      const extraColumns = dataset.headers.length - visibleHeaders.length;

      let note =
        `Showing ${visibleRows.length} of ${dataset.rows.length.toLocaleString()} rows.`;

      if (extraRows > 0) {
        note += ` ${extraRows.toLocaleString()} more rows are not displayed.`;
      }

      if (extraColumns > 0) {
        note += ` ${extraColumns} additional columns are not displayed in the preview.`;
      }

      elements.previewNote.textContent = note;
    }
  }

  function appendTextCell(row, text, tagName = "td") {
    const cell = document.createElement(tagName);
    cell.textContent = String(text);
    row.appendChild(cell);
    return cell;
  }

  /* ---------- Variable selectors ---------- */

  function populateVariableSelectors() {
    populateSelect(
      elements.variableOne,
      columnMetadata,
      "Select variable 1"
    );

    populateSelect(
      elements.variableTwo,
      columnMetadata,
      "Select variable 2"
    );

    if (elements.variableOne) elements.variableOne.disabled = false;
    if (elements.variableTwo) elements.variableTwo.disabled = false;

    updateTestButton();
  }

  function populateSelect(select, columns, placeholder) {
    if (!select) return;

    select.replaceChildren();

    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.textContent = placeholder;
    select.appendChild(initialOption);

    columns.forEach((column) => {
      const option = document.createElement("option");
      option.value = column.name;
      option.textContent = `${column.name} (${column.type})`;
      select.appendChild(option);
    });
  }

  /* ---------- Statistical test selection ---------- */

  function updateTestOptions() {
    const category = elements.testCategory?.value ?? "";
    const options = testOptions[category] ?? [];

    if (!elements.statisticalTest) return;

    elements.statisticalTest.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = options.length
      ? "Choose a statistical test"
      : "Select a category first";

    elements.statisticalTest.appendChild(placeholder);

    options.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      elements.statisticalTest.appendChild(option);
    });

    elements.statisticalTest.disabled = options.length === 0;

    clearTestState();
    updateTestButton();
  }

  function updateTestButton() {
    if (!elements.runTestButton) return;

    const test = elements.statisticalTest?.value;
    const variableOne = elements.variableOne?.value;
    const variableTwo = elements.variableTwo?.value;

    const needsTwoVariables = ![
      "one_sample_t"
    ].includes(test);

    const validSelection =
      Boolean(dataset) &&
      Boolean(test) &&
      Boolean(variableOne) &&
      (!needsTwoVariables || Boolean(variableTwo)) &&
      (!needsTwoVariables || variableOne !== variableTwo);

    elements.runTestButton.disabled = !validSelection;
  }

  /* ---------- Backend integration placeholder ---------- */

  async function runStatisticalTest() {
    if (!dataset || !selectedFile) {
      showTestStatus("Upload and inspect a dataset first.", "error");
      return;
    }

    const test = elements.statisticalTest?.value;
    const variableOne = elements.variableOne?.value;
    const variableTwo = elements.variableTwo?.value;

    if (!test || !variableOne) {
      showTestStatus("Select a statistical test and its variables.", "error");
      return;
    }

    if (test !== "one_sample_t" && !variableTwo) {
      showTestStatus("Select the second variable for this test.", "error");
      return;
    }

    if (variableOne === variableTwo && test !== "one_sample_t") {
      showTestStatus("Choose two different variables.", "error");
      return;
    }

    /*
      This frontend does not calculate statistical tests by itself.

      We will connect this function to your FastAPI backend after
      confirming its URL, endpoint, and expected request format.

      Do not display fabricated p-values or test statistics.
    */

    showTestStatus(
      "Dataset inspection is complete. Statistical calculations are not connected yet. Next, connect this selection to your FastAPI analysis endpoint.",
      "info"
    );
  }

  /* ---------- Status messages ---------- */

  function showUploadStatus(message, type = "info") {
    if (!elements.uploadStatus) return;

    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `upload-status status-${type}`;
  }

  function clearUploadStatus() {
    if (!elements.uploadStatus) return;

    elements.uploadStatus.textContent = "";
    elements.uploadStatus.className = "upload-status";
  }

  function showTestStatus(message, type = "info") {
    if (!elements.testStatus) return;

    elements.testStatus.textContent = message;
    elements.testStatus.className = `mt-3 upload-status status-${type}`;
  }

  function clearTestState() {
    if (elements.testStatus) {
      elements.testStatus.textContent = "";
      elements.testStatus.className = "mt-3 upload-status";
    }

    elements.testResults?.classList.add("d-none");

    if (elements.testResultsContent) {
      elements.testResultsContent.replaceChildren();
    }

    updateTestButton();
  }

  /* ---------- Reset workspace ---------- */

  function resetWorkspace() {
    selectedFile = null;
    dataset = null;
    columnMetadata = [];

    if (elements.fileInput) {
      elements.fileInput.value = "";
    }

    elements.selectedFile?.classList.add("d-none");
    elements.datasetOverview?.classList.add("d-none");

    if (elements.analyzeButton) {
      elements.analyzeButton.disabled = true;
      elements.analyzeButton.innerHTML =
        '<i class="bi bi-bar-chart-line me-2"></i>Inspect Dataset';
    }

    if (elements.testCategory) {
      elements.testCategory.value = "";
    }

    if (elements.statisticalTest) {
      elements.statisticalTest.replaceChildren();

      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Select a category first";

      elements.statisticalTest.appendChild(option);
      elements.statisticalTest.disabled = true;
    }

    [elements.variableOne, elements.variableTwo].forEach((select) => {
      if (!select) return;

      select.replaceChildren();

      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Select a dataset first";

      select.appendChild(option);
      select.disabled = true;
    });

    clearUploadStatus();
    clearTestState();
  }

  

  function getExtension(filename) {
    const parts = filename.toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};