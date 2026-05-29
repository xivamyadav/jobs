import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps {
    columns: { key: string; label: string }[];
    data: Record<string, any>[];
    renderCell?: (key: string, value: any, row: Record<string, any>) => ReactNode;
    className?: string;
}

const DataTable: FC<DataTableProps> = ({ columns, data, renderCell, className }) => {
    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column) => (
                                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {renderCell ? renderCell(column.key, row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;