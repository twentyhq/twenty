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
  width: fit-content;
  margin-top: 32px;
  border-collapse: collapse;
`;

const StyledTableHeader = styled.th`
  padding: 8px;
  border: 1px solid #ddd;
  border-collapse: collapse;
  background-color: #f1f1f1;
`;

const StyledTableRow = styled.tr<{ isEven: boolean }>`
  background-color: ${(props) => (props.isEven ? '#f1f1f1' : 'transparent')};
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
    <StyledTableContainer>
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
            <StyledTableRow key={index} isEven={index % 2 === 1}>
              <StyledVariable>{props}</StyledVariable>
              <StyledVariable>{type}</StyledVariable>
              <StyledDescription>{description}</StyledDescription>
              {display ? <StyledVariable>{defaultValue}</StyledVariable> : null}
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
