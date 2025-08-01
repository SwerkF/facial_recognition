import type React from 'react';

interface TableBaseProps {
    children: React.ReactNode;
    className?: string;
}

interface TableProps extends TableBaseProps {
    variant?: 'default' | 'striped';
}

export const Table: React.FC<TableProps> = ({ children, className = '', variant = 'default' }) => {
    const variantClasses = {
        default: '',
        striped: '[&_tbody_tr:nth-child(odd)]:bg-gray-50',
    };

    return (
        <div className="overflow-x-auto rounded-lg">
            <table
                className={`min-w-full divide-y divide-gray-200 ${variantClasses[variant]} ${className}`}
            >
                {children}
            </table>
        </div>
    );
};

interface TableHeaderProps extends TableBaseProps {
    sticky?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
    children,
    className = '',
    sticky = false,
}) => {
    return (
        <thead className={`bg-gray-50 ${sticky ? 'sticky top-0' : ''} ${className}`}>
            {children}
        </thead>
    );
};

export const TableBody: React.FC<TableBaseProps> = ({ children, className = '' }) => {
    return <tbody className={`divide-y divide-gray-200 bg-white ${className}`}>{children}</tbody>;
};

interface TableRowProps extends TableBaseProps {
    onClick?: () => void;
    hover?: boolean;
    selected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
    children,
    onClick,
    className = '',
    hover = true,
    selected = false,
}) => {
    return (
        <tr
            className={` ${hover ? 'hover:bg-gray-50' : ''} ${selected ? 'bg-blue-50' : ''} ${onClick ? 'cursor-pointer' : ''} ${className} `}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

interface TableHeadProps extends TableBaseProps {
    onClick?: () => void;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
}

export const TableHead: React.FC<TableHeadProps> = ({
    children,
    onClick,
    className = '',
    sortable = false,
    sortDirection,
}) => {
    return (
        <th
            className={`text-primary px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''} ${className} `}
            onClick={onClick}
        >
            <div className="flex items-center gap-2">
                {children}
                {sortable && (
                    <>
                        {sortDirection === 'asc' ? (
                            <svg
                                className="text-secondary h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7l4-4m0 0l4 4m-4-4v18"
                                />
                            </svg>
                        ) : sortDirection === 'desc' ? (
                            <svg
                                className="text-secondary h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 17l-4 4m0 0l-4-4m4 4V3"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                            </svg>
                        )}
                    </>
                )}
            </div>
        </th>
    );
};

interface TableCellProps extends TableBaseProps {
    align?: 'left' | 'center' | 'right';
    truncate?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
    children,
    className = '',
    align = 'left',
    truncate = false,
}) => {
    return (
        <td
            className={`px-6 py-4 text-sm ${align === 'center' ? 'text-center' : ''} ${align === 'right' ? 'text-right' : ''} ${truncate ? 'truncate' : 'whitespace-nowrap'} ${className} `}
        >
            {children}
        </td>
    );
};
