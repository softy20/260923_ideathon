import "./globals.css";

export const metadata = {
  title: "Stage Pass Korea",
  description:
    "Affordable, official performances in Seoul for short-term travelers — find shows under ₩50,000, including ones you can enjoy without knowing Korean.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
