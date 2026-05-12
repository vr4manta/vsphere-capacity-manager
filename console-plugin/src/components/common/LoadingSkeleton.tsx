import * as React from 'react';
import { Skeleton, Card, CardBody, CardTitle } from '@patternfly/react-core';

/**
 * Simple skeleton loader for text content
 */
export const TextSkeleton: React.FC<{ width?: string }> = ({ width = '100%' }) => (
  <Skeleton width={width} fontSize="md" />
);

/**
 * Skeleton loader for table rows
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index}>
        <Skeleton width="80%" fontSize="md" />
      </td>
    ))}
  </>
);

/**
 * Skeleton loader for full tables
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => (
  <table style={{ width: '100%' }}>
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          <TableRowSkeleton columns={columns} />
        </tr>
      ))}
    </tbody>
  </table>
);

/**
 * Skeleton loader for metric cards
 */
export const MetricCardSkeleton: React.FC<{ title: string }> = ({ title }) => (
  <Card>
    <CardTitle>{title}</CardTitle>
    <CardBody>
      <Skeleton width="60%" fontSize="2xl" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="40%" fontSize="sm" />
    </CardBody>
  </Card>
);

/**
 * Skeleton loader for charts
 */
export const ChartSkeleton: React.FC<{ title: string; height?: string }> = ({
  title,
  height = '250px',
}) => (
  <Card>
    <CardTitle>{title}</CardTitle>
    <CardBody>
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton shape="square" width="100%" height="100%" />
      </div>
    </CardBody>
  </Card>
);

/**
 * Skeleton loader for detail pages
 */
export const DetailPageSkeleton: React.FC = () => (
  <div>
    <Skeleton width="30%" fontSize="2xl" style={{ marginBottom: '2rem' }} />
    <Card style={{ marginBottom: '1rem' }}>
      <CardTitle>
        <Skeleton width="20%" />
      </CardTitle>
      <CardBody>
        <Skeleton width="100%" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="80%" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="60%" />
      </CardBody>
    </Card>
    <Card style={{ marginBottom: '1rem' }}>
      <CardTitle>
        <Skeleton width="25%" />
      </CardTitle>
      <CardBody>
        <Skeleton width="100%" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="90%" />
      </CardBody>
    </Card>
  </div>
);
