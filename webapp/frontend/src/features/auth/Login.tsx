import { useLogin } from '@/api/queries/authQueries';

import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDto, loginSchema } from '@shared/dto';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginDto>({
        resolver: zodResolver(loginSchema),
    });

    const { mutate: loginUser, isPending } = useLogin();

    const onSubmit = async (data: LoginDto) => {
        try {
            loginUser({
                ...data,
                rememberMe: data.rememberMe || false,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Card>
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600"
                >
                    <span className="text-2xl font-bold text-white">Logo</span>
                </motion.div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Connexion</h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 rounded-md">
                    <Input
                        label="Email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                        placeholder="votre@email.com"
                    />
                    <Input
                        label="Mot de passe"
                        type="password"
                        {...register('password')}
                        error={errors.password?.message}
                        placeholder="••••••••"
                    />
                </div>

                <Button
                    type="submit"
                    isLoading={isSubmitting || isPending}
                    disabled={isSubmitting || isPending}
                    loadingText="Connexion en cours..."
                >
                    Se connecter
                </Button>

                <div className="text-center text-sm">
                    <Link
                        to="/register"
                        className="font-medium text-blue-600 transition duration-150 ease-in-out hover:text-blue-500"
                    >
                        Pas encore de compte ? S'inscrire
                    </Link>
                </div>
            </form>
        </Card>
    );
}
