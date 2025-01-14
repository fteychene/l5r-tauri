import { RollResult } from "./model.ts"

interface ResultProps {
    result?: RollResult
}

function Result({ result }: ResultProps) {
    if (result) {
        return <div className="notification is-primary is-light py-2 my-3">Rolled {result.skill ? result.skill : "generic"} ={">"} {result.result}</div>;
    }
    return null;
}


export default Result