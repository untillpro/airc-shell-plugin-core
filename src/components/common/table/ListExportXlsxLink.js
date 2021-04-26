import React from 'react';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import { buildExportData } from '../../../classes/helpers';

const ListExportXslxLink = ({ data, columns, filename, text }) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const doExport = (d, columns, filename) => {
        const data = buildExportData(d, columns, ".xlsl");
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const exportData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(exportData, filename + fileExtension);
    }

    return (
        <a onClick={(e) => doExport(data, columns, filename)}>
            {text ? text : 'Export XLSX'}
        </a>
    );
}

export default ListExportXslxLink;