import React from 'react';

const renderSwatches = (type, colors) => {
  console.log('fff=', colors);
  return colors.map((color, id) => {
    /*  const normalizeColorValue =
      Array.isArray(color) && type === 'rgb'
        ? `rgb(${color[0]}, ${color[1]}, ${color[2]})`
        : color; */

    return (
      <div key={id++}>
        <div
          className="swatches"
          style={{
            backgroundColor: color,
            color: color,
          }}
        />
      </div>
    );
  });
};

export const Swatches = (props) => (
  <div className="display-swatches">{renderSwatches('hex', props.colors)}</div>
);
