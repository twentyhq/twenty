'use client';
import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';

const StyledTable = styled.table`
  width: 100%;
  margin-top: 32px;
  border-collapse: collapse;
`;

const StyledTableHeader = styled.th`
  padding: 8px;
  border: 1px solid #ddd;
  border-collapse: collapse;
`;

const StyledDescription = styled.td`
  border: 1px solid #ddd;
  font-size: 12px;
  padding: 20px 8px;
  text-align: center;
`;

const StyledVariable = styled.td`
  border: 1px solid #ddd;
  font-size: 12px;
  text-align: center;
  padding: 8px;
`;

interface ArticleTableProps {
  options: [string, string, string, string][];
}

const OptionTable = ({ options }: ArticleTableProps) => {
  let display = true;
  if (!options[0][3]) {
    display = false;
  }
  return (
    <StyledTable>
      <thead>
        <tr>
          <StyledTableHeader>Props</StyledTableHeader>
          <StyledTableHeader>Type</StyledTableHeader>
          <StyledTableHeader>Description</StyledTableHeader>
          {display ? <StyledTableHeader>Default</StyledTableHeader> : null}
        </tr>
      </thead>
      <tbody>
        {options.map(([props, type, description, defaultValue], index) => (
          <tr key={index}>
            <StyledVariable>{props}</StyledVariable>
            <StyledVariable>{type}</StyledVariable>
            <StyledDescription>{description}</StyledDescription>
            {display ? <StyledVariable>{defaultValue}</StyledVariable> : null}
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
