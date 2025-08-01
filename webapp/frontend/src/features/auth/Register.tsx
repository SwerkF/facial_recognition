import { useRegister } from '@/api/queries/authQueries';

import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterDto, registerSchema } from '@shared/dto';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';

export default function Register() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterDto>({
        resolver: zodResolver(registerSchema),
    });

    const { mutate: registerUser, isPending } = useRegister();

    const onSubmit = async (data: RegisterDto) => {
        try {
            registerUser(data);
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
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Inscription</h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nom"
                            {...register('lastName')}
                            error={errors.lastName?.message}
                            placeholder="Dupont"
                            required
                        />
                        <Input
                            label="Prénom"
                            {...register('firstName')}
                            error={errors.firstName?.message}
                            placeholder="Jean"
                            required
                        />
                    </div>
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
                        required
                    />
                    <Input
                        label="Confirmer le mot de passe"
                        type="password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-4">
                        <input type="checkbox" {...register('acceptTerms')} />
                        <label className="text-[0.6rem] text-gray-500" htmlFor="acceptTerms">
                            J'accepte les conditions d'utilisation et je comprends que mes données
                            seront traitées avec le plus grand soin pour améliorer mon expérience.
                            <span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className="flex items-center space-x-4">
                        <input type="checkbox" {...register('acceptPrivacy')} />
                        <label className="text-[0.6rem] text-gray-500" htmlFor="acceptPrivacy">
                            Je consens à la collecte et au traitement de mes données personnelles,
                            qui seront utilisées uniquement pour personnaliser mes services et ne
                            seront jamais vendues à des tiers.
                            <span className="text-red-500">*</span>
                        </label>
                    </div>
                </div>

                <Button
                    type="submit"
                    isLoading={isSubmitting || isPending}
                    disabled={isSubmitting || isPending}
                    loadingText="Inscription en cours..."
                >
                    S'inscrire
                </Button>

                <div className="text-center text-sm">
                    <Link
                        to="/login"
                        className="text-secondary font-medium transition duration-150 ease-in-out hover:text-blue-500"
                    >
                        Déjà un compte ? Se connecter
                    </Link>
                </div>
            </form>
        </Card>
    );
}
