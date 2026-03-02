import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex justify-center">
          <div className="container text-center">
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
