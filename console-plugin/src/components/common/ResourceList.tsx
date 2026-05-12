import * as React from 'react';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ThProps,
} from '@patternfly/react-table';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

export interface Column<T> {
  title: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface ResourceListProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: any;
  emptyMessage?: string;
  keyFn: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

/**
 * Generic ResourceList component for displaying K8s resources in a table
 */
export function ResourceList<T>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = 'No resources found',
  keyFn,
  onRowClick,
  className,
}: ResourceListProps<T>) {
  const [sortBy, setSortBy] = React.useState<{
    index: number;
    direction: 'asc' | 'desc';
  }>({ index: 0, direction: 'asc' });

  // Handle sort
  const onSort = (
    _event: React.MouseEvent,
    index: number,
    direction: 'asc' | 'desc',
  ) => {
    setSortBy({ index, direction });
  };

  const getSortParams = (columnIndex: number): ThProps['sort'] => {
    if (!columns[columnIndex].sortable) {
      return undefined;
    }

    return {
      sortBy: {
        index: sortBy.index,
        direction: sortBy.direction,
      },
      onSort,
      columnIndex,
    };
  };

  // Loading state
  if (loading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState>
        <SearchIcon />
        <Title headingLevel="h4" size="lg">
          Error loading resources
        </Title>
        <EmptyStateBody>{error.message || 'An error occurred'}</EmptyStateBody>
      </EmptyState>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <SearchIcon />
        <Title headingLevel="h4" size="lg">
          No resources
        </Title>
        <EmptyStateBody>{emptyMessage}</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Table aria-label="Resource list" variant="compact" className={className}>
      <Thead>
        <Tr>
          {columns.map((column, index) => (
            <Th key={column.key} sort={getSortParams(index)}>
              {column.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((item, rowIndex) => (
          <Tr
            key={keyFn(item)}
            onRowClick={onRowClick ? () => onRowClick(item) : undefined}
            style={onRowClick ? { cursor: 'pointer' } : undefined}
          >
            {columns.map((column, colIndex) => (
              <Td key={`${keyFn(item)}-${column.key}`} dataLabel={column.title}>
                {column.render ? column.render(item, rowIndex) : ''}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export interface LoadingBoxProps {
  message?: string;
}

/**
 * Simple loading component
 */
export const LoadingBox: React.FC<LoadingBoxProps> = ({ message = 'Loading...' }) => {
  return (
    <Bullseye>
      <EmptyState>
        <Spinner size="xl" />
        <Title headingLevel="h4" size="lg">
          {message}
        </Title>
      </EmptyState>
    </Bullseye>
  );
};

export interface ErrorBoxProps {
  error: any;
  title?: string;
}

/**
 * Simple error display component
 */
export const ErrorBox: React.FC<ErrorBoxProps> = ({
  error,
  title = 'Error loading resources',
}) => {
  return (
    <EmptyState>
      <SearchIcon />
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
      <EmptyStateBody>{error?.message || 'An error occurred'}</EmptyStateBody>
    </EmptyState>
  );
};
