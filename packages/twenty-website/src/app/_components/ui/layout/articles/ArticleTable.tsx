'use client';
import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';

const StyledTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 32px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTableHeader = styled.th`
  padding: 8px;
  border-bottom: 1px solid #ddd;
`;

const StyledDescription = styled.td`
  border-bottom: 1px solid #ddd;
  font-size: 12px;
  padding: 10px 0px 10px 20px;
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

const StyledTableRow = styled.tr<{ isEven: boolean }>`
  background-color: ${(props) => (props.isEven ? '#f1f1f1' : 'transparent')};
`;

interface ArticleTableProps {
  options: [string, string, string][];
}

const OptionTable = ({ options }: ArticleTableProps) => {
  return (
    <StyledTableContainer>
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
            <StyledTableRow key={index} isEven={index % 2 === 1}>
              <StyledVariable>{variable}</StyledVariable>
              <StyledExample>{defaultValue}</StyledExample>
              <StyledDescription>{description}</StyledDescription>
            </StyledTableRow>
          ))}
        </tbody>
      </StyledTable>
    </StyledTableContainer>
  );
};

OptionTable.propTypes = {
  options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

export default OptionTable;
