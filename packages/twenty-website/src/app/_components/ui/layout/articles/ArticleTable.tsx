'use client';
import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';

const StyledTable = styled.table`
  width: 100%;
  margin-top: 32px;
`;

const StyledTableHeader = styled.th`
  padding: 8px;
`;

const StyledDescription = styled.td`
  border-bottom: 1px solid #ddd;
  font-size: 12px;
  padding: 20px 0px 20px 20px;
  text-align: center;
`;

const StyledExample = styled.td`
  border-bottom: 1px solid #ddd;
  padding-right: 20px;
  font-size: 12px;
  text-align: center;
`;

const StyledVariable = styled.td`
  border-bottom: 1px solid #ddd;
  padding-right: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #538ce9;
`;

interface ArticleTableProps {
  options: [string, string, string][];
}

const OptionTable = ({ options }: ArticleTableProps) => {
  return (
    <StyledTable>
      <thead>
        <tr>
          <StyledTableHeader>Variable</StyledTableHeader>
          <StyledTableHeader>Example</StyledTableHeader>
          <StyledTableHeader>Description</StyledTableHeader>
        </tr>
      </thead>
      <tbody>
        {options.map(([variable, defaultValue, description], index) => (
          <tr key={index}>
            <StyledVariable>{variable}</StyledVariable>
            <StyledExample>{defaultValue}</StyledExample>
            <StyledDescription>{description}</StyledDescription>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
};

OptionTable.propTypes = {
  options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

export default OptionTable;
