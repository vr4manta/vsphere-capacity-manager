import * as React from 'react';
import { TextInput } from '@patternfly/react-core';
import '../../styles/dark-theme.scss';

interface ColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * ColumnFilter - Filter input for table columns matching reference design
 */
export const ColumnFilter: React.FC<ColumnFilterProps> = ({
  value,
  onChange,
  placeholder = 'Filter...',
}) => {
  return (
    <TextInput
      type="text"
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      placeholder={placeholder}
      aria-label={`Filter ${placeholder}`}
      style={{
        width: '100%',
        fontSize: '0.75rem',
        padding: '0.25rem 0.5rem',
      }}
    />
  );
};
