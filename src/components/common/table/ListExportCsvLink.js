import React from 'react';
import * as FileSaver from 'file-saver';
import jsonexport from 'jsonexport';
import { buildExportData } from '../../../classes/helpers';

const ListExportXslxLink = ({ data, columns, filename, text }) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.csv';

    const doExport = (d, columns, filename) => {
        const data = buildExportData(d, columns, ".xlsl");
        jsonexport(data, (err, csv) => {
            if (err) return console.error(err);
            
            const exportData = new Blob([csv], { type: fileType });
            FileSaver.saveAs(exportData, filename + fileExtension);
        });
        
    }

    return (
        <a onClick={(e) => doExport(data, columns, filename)}>
            {text ? text : 'Export XLSX'}
        </a>
    );
}

export default ListExportXslxLink;