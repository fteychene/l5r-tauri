import Icon from "@mdi/react";
import { RollResult } from "./model.ts"
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { mdiContentCopy } from '@mdi/js';

interface ResultProps {
    result?: RollResult
}

function Result({ result }: ResultProps) {
    if (result) {
        const resultText = `Rolled ${result.skill ? result.skill : "generic"} => ${result.result} [${result.rolls.join(", ")}]`;
        return (
            <div className="notification is-primary is-light py-2 my-3 level">
                <div className="level-left">
                    <p className="level-item">{resultText}</p>
                </div>
                <div className="level-right">
                    <p className="level-item"><a className="button" onClick={() => writeText(resultText).catch(e => {console.error(e); alert("Can't copy to clipboard. See console for details");})}><Icon path={mdiContentCopy} size={1} /></a></p>
                </div>
            </div>);
    }
    return null;
}

export default Result