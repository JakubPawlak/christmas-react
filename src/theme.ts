import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      navy: "#001f3f",    // Midnight navy background
      gold: "#d4af37",    // Gold accent
      red: "#b02323",     // Deep cranberry red
      offWhite: "#fef8e7" // Warm off-white
    },
  },
  fonts: {
    heading: `'Playfair Display', serif`,
    body: `'Montserrat', sans-serif`,
  },
  styles: {
    global: {
      "html, body": {
        height: "100%",
        margin: 0,
        padding: 0,
        backgroundColor: "brand.navy",
        color: "brand.offWhite",
        backgroundImage: "url('https://christmas.paintit.pl/annie-spratt-smaller-min.7ce768e704d55fe6.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      },
      // Add a subtle overlay if needed by wrapping page content in a Box with a bgColor and opacity.
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: "brand.red",
          color: "white",
          _hover: {
            bg: "brand.gold",
            color: "brand.navy",
          },
        },
      },
      defaultProps: {
        variant: "solid",
      },
    },
    Heading: {
      baseStyle: {
        color: "brand.offWhite",
      },
    },
    Input: {
        baseStyle: {
          field: {
            color: "brand.navy", // default text color for input fields
          },
        },
      },
  },
});

export default theme;
