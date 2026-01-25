import clsx from "clsx";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
// import type { JSX } from "react/jsx-runtime";

type Option = { key: string; label: string };

type Props<T extends FieldValues> = {
    type?: string;
    label: string;
    options: Option[];
} & UseControllerProps<T>;

export default function SelectInput <T extends FieldValues> (props : Props<T>) {
    const {field, fieldState} = useController({...props});
    
    return (
        <label className="floating-label text-left w-full">
            <span>{props.label}</span>
            <select
                {...field}
                value={field.value || `Select a ${props.label}`}
                className={clsx('select select-lg w-full', {
                    'input-error': !!fieldState.error,
                    'input-success': !!fieldState.error && fieldState.isDirty
                })}
                >
                  <option disabled>Select a{props.label}</option>
                  {props.options.map(option => (
                    <option key={option.key} value={option.key}>{option.label} </option>
                  ))}
                </select>
            {fieldState.error && (
                <p className="text-error text-sm">{String(fieldState.error.message)}</p>
            )}
        </label>
    )
}