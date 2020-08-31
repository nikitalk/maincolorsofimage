import React from 'react';

import { ColorExtractor } from '../ce';

export const Image = (props) =>
  props.error ? (
    <div className="error-message">
      An error occurred while processing the image.
    </div>
  ) : (
    <div
      className="image-container"
      style={{
        background: `url(${props.image})  center / contain no-repeat`,
        backgroundSize: '100%',
      }}
    >
      <ColorExtractor getColors={props.getColors} onError={props.onError}>
        <img src={props.image} style={{ display: 'none' }} />
      </ColorExtractor>
    </div>
  );
