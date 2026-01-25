import { useNavigate } from "react-router"
import { signIn } from "./accountSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "../../lib/stores/store";
import { LockClosedIcon } from "@heroicons/react/16/solid";
import TextInput from "../../app/shared/components/TextInput";
import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { useForm } from "react-hook-form";
import { users } from "../../lib/data/sampleData";
import { toast } from "react-toastify";

export default function LoginForm() {

    const navigate = useNavigate();
    const {control, handleSubmit, formState: {isValid}} = useForm({
        resolver: zodResolver(loginSchema),
    })

        const dispatch = useAppDispatch();

        const onSubmit = (data: LoginSchema) => {
            const user = users.find(x => x.email === data.email);
            if (user) {
                dispatch(signIn(user));
                navigate('/events');
            } else {
                toast.error('Invalid email or password')
            }
        }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="card bg-base-100 shadow-lg p-6 w-1/2 gap-6">
            <div className="card-title text-primary justify-center">
                <LockClosedIcon className="size-10" />
                <h3 className="text-3xl">Sign in to Re-vents</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextInput 
                    label="Email Address"
                    control={control}
                    name='email'
                />
                <TextInput 
                    label="Password"
                    control={control}
                    name='password'
                    type="password"
                />
                <button className="btn btn-primary w-full" disabled={!isValid} type="submit">
                    Sign In
                </button>
            </form>
        </div>
    </div>
  )
}