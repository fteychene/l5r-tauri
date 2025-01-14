import { useForm } from "react-hook-form";
import { RollFormInput } from "./model";


interface RollFormProps {
    formSubmit: (data: RollFormInput) => void
}

const RollForm = ({ formSubmit }: RollFormProps) => {
    const { register, formState: { errors }, handleSubmit } = useForm<RollFormInput>({
        defaultValues: {
            specialized: true
        }
    });

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
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
                        <button className="button">Roll !</button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default RollForm;