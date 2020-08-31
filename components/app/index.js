import React, { useState, useEffect, useRef } from "react";

import { Swatches } from "./Swatches";
import { SearchInput } from "./SearchInput";
import { FileInput } from "./UploadButton";
import ColorThief from "./ColorThief";
import useImageColor from "use-image-color";
import ColorExtractor from "./ColorExtractor";

const IMAGE = "https://i.imgur.com/OCyjHNF.jpg";

function Palette(props) {
  const { colors } = useImageColor(props.url, {
    cors: true,
    colors: 7,
    windowSize: 160,
  });

  return (
    <div className="display-swatches">
      {colors &&
        colors.map((p, i) => {
          if (p < "#fafafa")
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

export function App(props) {
  const colorThief = new ColorThief();
  const [image, setImage] = useState(IMAGE);
  const [colors, setColors] = useState({});
  const [palettes, setPalettes] = useState({});
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef();

  useEffect(() => {
    const searchInput = document.getElementById("s-input");

    searchInput.focus();

    const uploader = document.getElementById("uploader");
    const button = document.getElementById("file-upload");

    button.addEventListener("click", (e) => {
      if (uploader) {
        uploader.click();
      }

      e.preventDefault();
    });
  }, []);

  const uploadFiles = (e) => {
    setImage(window.URL.createObjectURL(e.target.files[0]));
    setHasError(false);
  };

  const handleImage = (e) => {
    isResponseOk(e.target.value);
    setImage(e.target.value);
  };

  const isResponseOk = (path) =>
    fetch(path)
      .then((res) => (res.status === 200 ? setHasError(false) : null))
      .catch((err) => (err ? setHasError(true) : null));

  const thiefColor = (img, index) => {
    const result = colorThief.getColorAsync(img).then((data) => {
      const rgb = colorThief.convertColorRgb(data);
      let q = colors;
      q[index] = rgb;

      setColors(q);
    });
  };

  const thiefPalette = (index) => {
    const data = colorThief.getPalette(imageRef.current, 6);
    data.shift();
    const rgb = colorThief.convertColorRgb(data);
    let q = colors;
    q[index] = rgb;

    setPalettes(q);
  };

  const getItem = (img, index, color, palette = []) => {
    !color && thiefColor(img, index);

    return (
      <>
        <img
          ref={imageRef}
          src={img}
          style={{ display: "none" }}
          onLoad={() => thiefPalette(index)}
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
      </>
    );
  };

  return (
    <div
      className="center-content"
      style={{
        flexDirection: "column",
      }}
    >
      <div className="ttt">
        <div
          className="image-container"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <ColorExtractor
          getColors={setColors}
          onError={(error) => setHasError(true)}
        >
          <img src={image} style={{ display: "none" }} />
        </ColorExtractor>
        {colors.length > 0 ? <Swatches colors={colors} /> : null}
      </div>
      <div className="ttt">
        <div
          className="image-container"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        {getItem(image, 0, colors[0], palettes[0])}
      </div>
      <div className="ttt">
        <div
          className="image-container"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <Palette url={image} />
      </div>

      <SearchInput
        imagePath={image === IMAGE ? "" : image}
        handleImage={handleImage}
        getColors={setColors}
      />
      <FileInput uploadFiles={uploadFiles} />
    </div>
  );
}
