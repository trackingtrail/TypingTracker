import { memo, useRef } from "react";
import Typography from "./Typography";

const nextCharStyling = {
  background: "#fff",
  display: "inline-block",
  whiteSpace: "pre",
  margin: "0px",
  color: "gray",
  caretShape: "underscore",
  caretColor: "black",
  outline: "0px solid transparent"

};

const NextCharTypography = memo(({ children, ...props }) => {
  let nextCharRef = useRef();
  return (
    <Typography refs={nextCharRef} id="cursor" style={nextCharStyling} contentEditable="true" suppressContentEditableWarning={true}>
      {children}
    </Typography>
  );
});

export default NextCharTypography;
