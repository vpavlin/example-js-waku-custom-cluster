import './App.css';
import { WakuContext, WakuContextProvider } from './hooks/useWaku';
import Waku from './components/waku';

const status = (text:string, typ:string) => {
  console.log(text)
} 
function App() {
  return (
    <WakuContextProvider updateStatus={status}>
      <Waku />
    </WakuContextProvider>
  );
}

export default App;
