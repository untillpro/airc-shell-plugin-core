import React from 'react'
import { CSVLink } from 'react-csv'

const ListExportCsvLink = ({data, filename, text}) => {
    return (
        <CSVLink data={data} filename={`${filename}`}>
            {text ? text : 'Export CSV'}
        </CSVLink>
    );
}

export default ListExportCsvLink;