import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import RollForm from './RollForm.tsx'
import Result from './Result.tsx'
import { RollFormInput, RollResult } from './model.ts'
import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog';
import Icon from '@mdi/react';
import { mdiPlus, mdiDiceD10, mdiDelete, mdiContentSave } from '@mdi/js';
import { useForm } from 'react-hook-form'

enum Mode {
  GenericRoll,
  Skill,
  History
}

type Skill = {
  name: string,
  roll: number,
  keep: number,
  specialized: boolean,
}

const App = () => {
  const [rolled, setRollResult] = useState<RollResult>()
  const [skillRolled, setSkillRolled] = useState<RollResult>()
  const [history, setHistory] = useState<RollResult[]>([])
  const [mode, setMode] = useState<Mode>(Mode.GenericRoll)
  const [skills, setSkills] = useState<Skill[]>([])

  async function handleGenericRollSubmit(data: RollFormInput) {
    // Number from TS seems to be sent by Tauri as string so force a pure JS parsing. ¯\_(ツ)_/¯
    let result: RollResult = await invoke("roll", { dice: parseInt(data.roll.toString()), keep: parseInt(data.keep.toString()), specialized: data.specialized })
    setHistory(history => [result, ...history].slice(0, 10))
    setRollResult(result);
  }

  async function handleSkillRoll(skill: Skill) {
    let result: RollResult = await invoke("roll", { skill: skill.name, dice: skill.roll, keep: skill.keep, specialized: skill.specialized })
    setHistory(history => [result, ...history].slice(0, 10))
    setSkillRolled(result);
  }

  async function loadSkills(path: string) {
    var skills: Skill[] = await invoke("load_skills_command", { path })
    return skills
  }

  const [newSkillToggle, setNewSkillToggle] = useState<boolean>(false)

  interface NewSkillForm {
    name: string,
    roll: number,
    keep: number,
    specialized: boolean,
  }
  const { register, formState: { errors }, handleSubmit, reset } = useForm<NewSkillForm>({
    defaultValues: {
      specialized: true
    }
  });

  const AddSkill = (datas: NewSkillForm) => {
    setSkills(skills => [{ name: datas.name, roll: parseInt(datas.roll.toString()), keep: parseInt(datas.keep.toString()), specialized: datas.specialized }, ...skills]);
    setNewSkillToggle(false);
    reset();
  }

  return (
    <StrictMode>
      <h1 className="title my-3">L5R Dice roller</h1>

      <div className="tabs is-toggle is-toggle-rounded is-centered">
        <ul>
          <li className={mode == Mode.GenericRoll ? "is-active" : ""} onClick={() => setMode(Mode.GenericRoll)} >
            <a>
              <span>Generic</span>
            </a>
          </li>
          <li className={mode == Mode.Skill ? "is-active" : ""} onClick={() => setMode(Mode.Skill)} >
            <a>
              <span>Skills</span>
            </a>
          </li>
          <li className={mode == Mode.History ? "is-active" : ""} onClick={() => setMode(Mode.History)} >
            <a>
              <span>History</span>
            </a>
          </li>
        </ul>
      </div>
      <div className={mode == Mode.GenericRoll ? "" : "is-hidden"}>
        <RollForm formSubmit={handleGenericRollSubmit} />
        <Result result={rolled} />
      </div>

      <div className={mode == Mode.Skill ? "" : "is-hidden"}>

        <table className="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Roll</th>
              <th>Keep</th>
              <th><abbr title="Specialized">Spe</abbr></th>
              <th>_</th>
            </tr>
          </thead>
          <tbody>
            {skills?.map(skill =>
              <tr>
                <th> {skill.name} </th>
                <th> {skill.roll} </th>
                <th> {skill.keep} </th>
                <th> <input type="checkbox" disabled checked={skill.specialized} /></th>
                <th>
                  <div className="buttons has-addons">
                    <button className="button is-primary" onClick={() => handleSkillRoll(skill)}>
                      <span className="icon is-small">
                        <Icon path={mdiDiceD10} size={0.7} />
                      </span>
                      <span>Roll</span>
                    </button>
                    <button className="button is-is-danger" onClick={() => setSkills(skills => skills?.filter(v => v.name != skill.name))}>
                      <span className="icon is-small">
                        <Icon path={mdiDelete} size={0.7} />
                      </span>
                    </button>
                  </div>
                </th>
              </tr>)}
          </tbody>
        </table>

        <nav className="level">
          <div className="level-left">
            <p className="level-item"><a className="button" onClick={() => setNewSkillToggle(true)}>New</a></p>
          </div>
          <div className="level-right">
            <p className="level-item">
              <button className="button" disabled={skills.length == 0} onClick={() => save({
                filters: [
                  {
                    name: 'Json',
                    extensions: ['json'],
                  },
                ],
              }).then(path => invoke("save_skills_command", { path: path, skills: skills }))
                .then(filePath => alert("Saved to "+filePath))
                .catch((error) => console.error(error))}>
                <span className="icon is-small">
                  <Icon path={mdiContentSave} size={0.7} />
                </span>
                <span>Save</span>
              </button>
            </p>
            <p>
              <div className="file" onClick={() => open({
                multiple: false,
                directory: false,
              }).then((path) => loadSkills(path!)).then(skills => setSkills(skills))} >
                <label className="file-label">
                  <p className="file-input" />
                  <span className="file-cta">
                    <span className="file-icon">
                      <Icon path={mdiPlus}
                        title="Add file"
                        size={1}
                      />
                      <i className="mdi mdi-add"></i>
                    </span>
                    <span className="file-label">Import</span>
                  </span>
                </label>
              </div>
            </p>
          </div>
        </nav>

        <div className={newSkillToggle ? "notification" : "is-hidden"}>
          <button className="delete" aria-label="delete" onClick={() => setNewSkillToggle(false)} />

          <form onSubmit={handleSubmit(AddSkill)}>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Name</label>
              </div>
              <div className="field-body">
                <div className="field is-narrow">
                  <p className="control">
                    <input className="input" {...register("name", { required: true })} />
                  </p>
                  {errors.name?.type === "required" && (
                    <p className="help is-danger" role="alert">Required value</p>
                  )}
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Roll</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control">
                    <input className="input" type="number" placeholder="10" {...register("roll", { required: true })} />
                  </p>
                  {errors.roll?.type === "required" && (
                    <p className="help is-danger" role="alert">Required integer value</p>
                  )}
                </div>
                <div className="control mr-2 label">
                  g
                </div>
                <div className="field">
                  <p className="control">
                    <input className="input" type="number" placeholder="3" {...register("keep", { required: true })} />
                  </p>
                  {errors.keep?.type === "required" && (
                    <p className="help is-danger" role="alert">Required integer value</p>
                  )}
                </div>
              </div>

            </div>

            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">Specialized</label>
              </div>
              <div className="field-body">
                <div className="control">
                  <input type="checkbox" {...register("specialized")} />
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label"></div>
              <div className="field-body">
                <div className="control">
                  <button className="button is-primary">
                    <span className="icon is-small">
                      <Icon path={mdiPlus} size={1} />
                    </span>
                    <span>Add</span></button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <Result result={skillRolled} />

      </div>

      <div className={mode == Mode.History ? "" : "is-hidden"}>
        <div className="fixed-grid">
          <div className="grid">
            {history.map(roll =>
              <div className="card cell mb-2">
                <header className="card-header">
                  <p className="card-header-title">{roll.skill || "Generic"}</p>
                </header>
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
            )}
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
