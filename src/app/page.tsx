import GoogleMap from "./GoogleMap/page";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="mb-5">HOLA PAPI</h1>
      <GoogleMap />
    </main>
  );
}
