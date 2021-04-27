import React from "react";
import styled from "@emotion/styled";

const cellSize = 30;
const BoardContainer = styled.div`
  width: ${cellSize * 10 + 2}px;
  height: ${cellSize * 10 + 2}px;
  border: 1px solid red;
`;

const BoardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(10, ${cellSize}px);
`;

function BoardCellBase(props) {
  const { className, cell, row, column, onClick } = props;

  return (
    <div onClick={() => onClick(row, column)} className={className}>
      {cell}
    </div>
  );
}

const BorderCell = styled(BoardCellBase)`
  border: 1px solid green;
  width: ${cellSize}px;
  height: ${cellSize}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &:hover {
    outline: 2px solid blue;
  }
`;

export function Board(props) {
  const { data, onClick } = props;

  return (
    <BoardContainer>
      {data.map((row, rowIndex) => {
        return (
          <BoardRow key={rowIndex}>
            {row.map((cell, cellIndex) => {
              return (
                <BorderCell
                  cell={cell}
                  key={cellIndex}
                  row={rowIndex}
                  column={cellIndex}
                  onClick={onClick}
                />
              );
            })}
          </BoardRow>
        );
      })}
    </BoardContainer>
  );
}
