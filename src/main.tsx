import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import RollForm from './RollForm.tsx'
import Result from './Result.tsx'
import { RollFormInput, RollResult } from './model.ts'
import { invoke } from '@tauri-apps/api/core'

enum Mode {
  GenericRoll,
  History
}

const App = () => {
  const [rolled, setRollResult] = useState<RollResult>()
  const [history, setHistory] = useState<RollResult[]>([])
  const [mode, setMode] = useState<Mode>(Mode.GenericRoll)

  async function handleGenericRollSubmit(data: RollFormInput) {
    // Number from TS seems to be sent by Tauri as string so force a pure JS parsing. ¯\_(ツ)_/¯
    let result: RollResult = await invoke("roll", { dice: parseInt(data.roll.toString()), keep: parseInt(data.keep.toString()), specialized: data.specialized })
    setHistory(history => [result, ...history].slice(0, 10))
    setRollResult(result);
  }

  return (
    <StrictMode>
      <h1 className="title my-3">L5R Dice roller</h1>

      <div className="tabs is-toggle is-toggle-rounded is-centered">
        <ul>
          <li className={mode == Mode.GenericRoll ? "is-active" : ""} onClick={() => setMode(Mode.GenericRoll)} >
            <a>
              <span className="is-small"><i className="fas"></i></span>
              <span>Generic</span>
            </a>
          </li>
          <li className={mode == Mode.History ? "is-active" : ""} onClick={() => setMode(Mode.History)} >
            <a>
              <span className="is-small"><i className="fas"></i></span>
              <span>History</span>
            </a>
          </li>
        </ul>
      </div>
      <div className={mode == Mode.GenericRoll ? "" : "is-hidden"}>
        <RollForm formSubmit={handleGenericRollSubmit} />
        <Result result={rolled} />
      </div>
    
      <div className={mode == Mode.History ?  "" : "is-hidden"}>
        <div className="fixed-grid">
          <div className="grid">
            {history.map(roll =>
              <div className="card cell mb-2">
                {/* <header className="card-header">
                  <p className="card-header-title">{roll.skill || "Generic"}</p>
                </header> */}
                <div className="card-content py-2">
                  <div className="content">
                    Result : {roll.result}
                    <br />
                    Roll : {roll.dice}g{roll.keep}
                    <br />
                    Details [{roll.rolls.join(", ")}]
                  </div>
                </div>
              </div>
            )
            }
          </div>
        </div>
        </div>
    </StrictMode>
  )
}



createRoot(document.getElementById('root')!).render(
  <App />
  ,
)
