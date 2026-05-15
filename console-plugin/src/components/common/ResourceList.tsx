import * as React from 'react';
import { useTranslation } from 'react-i18next';
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
import { NAMESPACE } from '../../i18n';
import { ColumnFilter } from './ColumnFilter';
import '../../styles/dark-theme.scss';

export interface Column<T> {
  title: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterValue?: (item: T) => string;
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
  emptyMessage,
  keyFn,
  onRowClick,
  className,
}: ResourceListProps<T>) {
  const { t } = useTranslation(NAMESPACE);
  const [sortBy, setSortBy] = React.useState<{
    index: number;
    direction: 'asc' | 'desc';
  }>({ index: 0, direction: 'asc' });
  const [filters, setFilters] = React.useState<{ [key: string]: string }>({});

  // Filter data based on column filters
  const filteredData = React.useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      return columns.every((column) => {
        const filterValue = filters[column.key];
        if (!filterValue || !column.filterable) return true;

        const itemValue = column.filterValue
          ? column.filterValue(item)
          : column.render
          ? String(column.render(item, 0))
          : '';

        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters, columns]);

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  };

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
          {t('Error loading resources')}
        </Title>
        <EmptyStateBody>{error.message || t('An error occurred')}</EmptyStateBody>
      </EmptyState>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <SearchIcon />
        <Title headingLevel="h4" size="lg">
          {t('No resources')}
        </Title>
        <EmptyStateBody>{emptyMessage || t('No resources found')}</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div className="vsphere-capacity-manager__dark-theme">
      <Table aria-label={t('Resource list')} variant="compact" className={className}>
        <Thead>
          <Tr>
            {columns.map((column, index) => (
              <Th key={column.key} sort={getSortParams(index)}>
                {column.title}
              </Th>
            ))}
          </Tr>
          <Tr>
            {columns.map((column) => (
              <Th key={`filter-${column.key}`}>
                {column.filterable !== false && (
                  <ColumnFilter
                    value={filters[column.key] || ''}
                    onChange={(value) => handleFilterChange(column.key, value)}
                    placeholder="Filter..."
                  />
                )}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {filteredData.map((item, rowIndex) => (
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
    </div>
  );
}

export interface LoadingBoxProps {
  message?: string;
}

/**
 * Simple loading component
 */
export const LoadingBox: React.FC<LoadingBoxProps> = ({ message }) => {
  const { t } = useTranslation(NAMESPACE);

  return (
    <Bullseye>
      <EmptyState>
        <Spinner size="xl" />
        <Title headingLevel="h4" size="lg">
          {message || t('Loading...')}
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
export const ErrorBox: React.FC<ErrorBoxProps> = ({ error, title }) => {
  const { t } = useTranslation(NAMESPACE);

  return (
    <EmptyState>
      <SearchIcon />
      <Title headingLevel="h4" size="lg">
        {title || t('Error loading resources')}
      </Title>
      <EmptyStateBody>{error?.message || t('An error occurred')}</EmptyStateBody>
    </EmptyState>
  );
};
