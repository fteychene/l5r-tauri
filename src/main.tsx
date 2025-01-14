import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import RollForm from './RollForm.tsx'
import Result from './Result.tsx'
import { RollFormInput, RollResult } from './model.ts'
import { invoke } from '@tauri-apps/api/core'


const App = () => {
  const [rolled, setRollResult] = useState<RollResult>()

  async function handleGenericRollSubmit(data: RollFormInput) {
    // Number from TS seems to be sent by Tauri as string so force a pure JS parsing. ¯\_(ツ)_/¯
    let result: string = await invoke("roll", { dice: parseInt(data.roll.toString()), keep: parseInt(data.keep.toString()), specialized: data.specialized })
    setRollResult({ result: result });
  }

  return (
    <StrictMode>
      <h1 className="title my-3">L5R Dice roller</h1>
      <RollForm formSubmit={handleGenericRollSubmit} />
      <Result result={rolled} />
    </StrictMode>
  )
}



createRoot(document.getElementById('root')!).render(
  <App />
  ,
)
