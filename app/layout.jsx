import "./globals.css";

export const metadata = {
  title: "Stage Pass Korea",
  description:
    "Affordable, official performances in Seoul for short-term travelers — find shows under ₩50,000, including ones you can enjoy without knowing Korean.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
