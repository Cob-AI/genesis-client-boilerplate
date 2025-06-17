import { GameView } from './components/GameView';
import './styles/main.css';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Genesis Engine Game</h1>
      </header>
      <main>
        <GameView />
      </main>
    </div>
  );
}
export default App;