import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

interface ErrorPageProps {
    statusCode?: number;
    title?: string;
    message?: string;
}

export default function ErrorPage({
    statusCode = 404,
    title = 'Page non trouvée',
    message = "Désolé, nous n'avons pas pu trouver la page que vous recherchez.",
}: ErrorPageProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 text-center shadow-lg"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100"
                >
                    <svg
                        className="h-12 w-12 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </motion.div>

                <h1 className="text-4xl font-bold text-gray-900">
                    {statusCode}: {title}
                </h1>

                <p className="text-gray-600">{message}</p>

                <div>
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-8 rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Retour à l&apos;accueil
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
