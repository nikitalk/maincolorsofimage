import React from 'react';
import { Image } from './Image';
import { Swatches } from './Swatches';
import { SearchInput } from './SearchInput';
import { FileInput } from './UploadButton';
import ColorThief from './ColorThief';
import useImageColor from 'use-image-color';

const IMAGE = 'https://i.imgur.com/OCyjHNF.jpg';

function Card(props) {
  const { colors } = useImageColor(props.url, {
    cors: true,
    colors: 6,
    windowSize: 10,
  });
  console.log(colors);

  return (
    <div className="mesBottom">
      {colors &&
        colors.map((p, i) => {
          return (
            <div
              key={`palette-${i}`}
              className="bottomBlock"
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
    const data = this.colorThief.getPalette(this[`$img${index}`], 7);
    data.shift();
    const rgb = this.colorThief.convertColorRgb(data);
    this.palettes[index] = rgb;
    this.setState({ palettes: this.palettes });
  }

  getItem(img, index, color, palette = []) {
    !color && this.thiefColor(img, index);

    return (
      <div className="itemRoot" key={`img-${index}`}>
        <img
          ref={(dom) => {
            this[`$img${index}`] = dom;
          }}
          src={img}
          onLoad={() => this.thiefPalette(index)}
        />

        <div className="mes">
          <div className="mesTop">
            <div className="topBlock" style={{ background: color }}></div>
          </div>
          <div className="mesBottom">
            {palette.map((p, i) => {
              return (
                <div
                  key={`palette-${i}`}
                  className="bottomBlock"
                  style={{ background: p }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { colors, palettes, localUrl } = this.state;

    return (
      <div
        className="center-content"
        style={{
          flexDirection: 'column',
        }}
      >
        <div className="ttt">
          <Image
            error={this.state.hasError}
            image={this.state.image}
            getColors={this.getColors}
            onLoad={() => this.thiefPalette(0)}
            onError={(error) => this.setState({ hasError: true })}
          />
          {this.state.colors.length > 0 ? (
            <Swatches colors={this.state.colors} />
          ) : null}
        </div>
        {this.getItem(this.state.image, 0, colors[0], palettes[0])}
        <Card url={this.state.image} />

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
