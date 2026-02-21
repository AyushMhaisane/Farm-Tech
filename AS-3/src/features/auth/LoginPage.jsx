import { useState } from 'react';
import { supabase } from '../../supabaseClient';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                // Log in existing user
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // Success! Redirect to the dashboard
                window.location.href = '/';
            } else {
                // Register new user
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;

                setMessage('Registration successful! You can now log in.');
                setIsLogin(true); // Switch back to login view
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        🌾
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">
                        {isLogin ? 'Enter your details to access your dashboard.' : 'Join the Agri-Dash community today.'}
                    </p>
                </div>

                {/* Alerts */}
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold text-center border border-red-100">{error}</div>}
                {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-6 text-sm font-bold text-center border border-green-100">{message}</div>}

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            placeholder="farmer@village.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                {/* Toggle Login/Register */}
                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
                        className="text-sm font-bold text-slate-500 hover:text-green-600 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;