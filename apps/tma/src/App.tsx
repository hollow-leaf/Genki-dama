import "./App.css";
import { TransferTon } from "./components/TransferTon";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import styled from "styled-components";
import { Button, FlexBoxCol, FlexBoxRow } from "./components/styled/styled";
import "@twa-dev/sdk";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const StyledApp = styled.div`
  background-color: #e8e8e8;
  color: black;

  @media (prefers-color-scheme: dark) {
    background-color: #222;
    color: white;
  }
  min-height: 100vh;
  padding: 20px 20px;
`;

const AppContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

function App() {
  return (
    <div className="App">
      <StyledApp>
        <AppContainer>
          <FlexBoxCol>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/transfer" element={<TransferTon />} />
              </Routes>
            </BrowserRouter>
          </FlexBoxCol>
        </AppContainer>
      </StyledApp>
    </div>
  );
}

export default App;
