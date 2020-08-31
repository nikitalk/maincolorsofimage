import React from 'react';
//import { Image } from './Image';
import { Swatches } from './Swatches';
import { SearchInput } from './SearchInput';
import { FileInput } from './UploadButton';
import ColorThief from './ColorThief';
import useImageColor from 'use-image-color';
import { ColorExtractor } from '../ce';

const IMAGE = 'https://i.imgur.com/OCyjHNF.jpg';

function Card(props) {
  const { colors } = useImageColor(props.url, {
    cors: true,
    colors: 6,
    windowSize: 16,
  });
  console.log(colors);

  return (
    <div className="display-swatches">
      {colors &&
        colors.map((p, i) => {
          return (
            <div
              key={`palette-${i}`}
              className="swatches"
              style={{ background: p }}
            ></div>
          );
        })}
    </div>
  );
}

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.colors = {};
    this.palettes = {};
    this.state = {
      image: IMAGE,
      colors: this.colors,
      palettes: this.palettes,
      hasError: false,
    };

    this.colorThief = new ColorThief();
  }

  componentDidMount() {
    const searchInput = document.getElementById('s-input');

    searchInput.focus();

    const uploader = document.getElementById('uploader');
    const button = document.getElementById('file-upload');

    button.addEventListener('click', (e) => {
      if (uploader) {
        uploader.click();
      }

      e.preventDefault();
    });
  }

  uploadFiles = (e) => {
    this.setState({
      image: window.URL.createObjectURL(e.target.files[0]),
      hasError: false,
    });
  };

  getColors = (colors) => {
    this.setState((state) => ({ colors: [...colors], hasError: false }));
  };

  handleImage = (e) => {
    this.isResponseOk(e.target.value);
    this.setState({ image: e.target.value });
  };

  isResponseOk = (path) =>
    fetch(path)
      .then((res) =>
        res.status === 200 ? this.setState({ hasError: false }) : null
      )
      .catch((err) => (err ? this.setState({ hasError: true }) : null));

  thiefColor(img, index) {
    const result = this.colorThief.getColorAsync(img).then((data) => {
      const rgb = this.colorThief.convertColorRgb(data);
      this.colors[index] = rgb;
      this.setState({ colors: this.colors });
    });
  }

  thiefPalette(index) {
    const data = this.colorThief.getPalette(this[`$img${index}`], 6);
    data.shift();
    const rgb = this.colorThief.convertColorRgb(data);
    this.palettes[index] = rgb;
    this.setState({ palettes: this.palettes });
  }

  getItem(img, index, color, palette = []) {
    !color && this.thiefColor(img, index);
    console.log(color);
    return (
      <div className="itemRoot" key={`img-${index}`}>
        <img
          ref={(dom) => {
            this[`$img${index}`] = dom;
          }}
          src={img}
          style={{ display: 'none' }}
          onLoad={() => this.thiefPalette(index)}
        />

        <div className="display-swatches">
          <div className="swatches" style={{ background: color }}></div>
          {palette.map((p, i) => {
            return (
              <div
                key={`palette-${i}`}
                className="swatches"
                style={{ background: p }}
              ></div>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const { colors, palettes } = this.state;

    return (
      <div
        className="center-content"
        style={{
          flexDirection: 'column',
        }}
      >
        <div className="ttt">
          <div
            className="image-container"
            style={{
              background: `url(${this.state.image})  center / contain no-repeat`,
              backgroundSize: '100%',
            }}
          ></div>
          <ColorExtractor
            getColors={this.getColors}
            onError={(error) => this.setState({ hasError: true })}
          >
            <img src={this.state.image} style={{ display: 'none' }} />
          </ColorExtractor>
          {this.state.colors.length > 0 ? (
            <Swatches colors={this.state.colors} />
          ) : null}
        </div>
        <div className="ttt">
          <div
            className="image-container"
            style={{
              background: `url(${this.state.image})  center / contain no-repeat`,
              backgroundSize: '100%',
            }}
          ></div>
          {this.getItem(this.state.image, 0, colors[0], palettes[0])}
        </div>
        <div className="ttt">
          <div
            className="image-container"
            style={{
              background: `url(${this.state.image})  center / contain no-repeat`,
              backgroundSize: '100%',
            }}
          ></div>
          <Card url={this.state.image} />
        </div>

        <SearchInput
          imagePath={this.state.image === IMAGE ? '' : this.state.image}
          handleImage={this.handleImage}
          getColors={this.getColors}
        />
        <FileInput uploadFiles={this.uploadFiles} />
      </div>
    );
  }
}
