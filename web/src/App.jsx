import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TeamList from "./components/TeamList";
import CreateTeam from "./components/CreateTeam";
import TeamDetail from "./components/TeamDetail";
import PokemonForm from "./components/PokemonForm";
import WeaknessChart from "./components/WeaknessChart";

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <header
          style={{
            backgroundColor: "#dc2626",
            color: "#fff",
            padding: "14px 24px",
            fontSize: 20,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}
        >
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Pokemon Team Builder
          </Link>
        </header>
        <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
          <Routes>
            <Route path="/" element={<TeamList />} />
            <Route path="/create-team" element={<CreateTeam />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/team/:teamId/add-pokemon" element={<PokemonForm />} />
            <Route path="/team/:teamId/edit-pokemon/:pokemonId" element={<PokemonForm edit />} />
            <Route path="/team/:id/weakness" element={<WeaknessChart />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
