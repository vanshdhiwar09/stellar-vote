import { useState } from 'react';
import { PlusCircle, Trash2, Rocket } from 'lucide-react';
import { useStellar } from '../context/StellarContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CreatePoll = () => {
    const { createPoll, txStatus, walletAddress } = useStellar();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [options, setOptions] = useState(['', '']);

    const handleAddOption = () => {
        if (options.length >= 10) {
            toast.error('Maximum of 10 options allowed.');
            return;
        }
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) {
            toast.error('Minimum of 2 options required.');
            return;
        }
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!walletAddress) {
            toast.error('Please connect your wallet first.');
            return;
        }

        if (title.trim() === '') {
            toast.error('Poll title cannot be empty.');
            return;
        }

        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
            toast.error('You must provide at least 2 valid options.');
            return;
        }

        try {
            await createPoll(title.trim(), validOptions);
            toast.success('Poll created successfully!');
            navigate('/polls');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create poll');
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto w-full pb-10 fade-in font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create New Poll</h1>
                    <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                        <PlusCircle className="w-5 h-5 text-indigo-400" />
                    </div>
                </div>
                <p className="text-sm text-slate-400 mb-8">
                    Deploy a brand new poll on the Stellar Testnet in seconds.
                </p>

                <form onSubmit={handleSubmit} className="relative bg-[#0a0a1f]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 sm:p-10 shadow-2xl overflow-hidden group">

                    {/* Background glow effects strictly for aesthetics */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>

                    <div className="relative z-10">
                        {/* Title Input */}
                        <div className="mb-10">
                            <label className="block text-sm font-semibold text-slate-300 mb-3">Poll Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What is your favorite Web3 Ecosystem?"
                                className="w-full bg-[#111129]/60 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-inner"
                            />
                        </div>

                        {/* Options Section */}
                        <div className="space-y-4 mb-10">
                            <label className="block text-sm font-semibold text-slate-300 mb-3">Options</label>

                            {options.map((opt, index) => (
                                <div key={index} className="flex items-center gap-3 group/opt">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="w-full bg-[#111129]/60 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="p-4 bg-red-500/5 text-red-400/50 border border-transparent rounded-xl hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover/opt:text-red-400"
                                        disabled={options.length <= 2}
                                        title="Remove option"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    disabled={options.length >= 10}
                                    className="w-full py-4 border-[1.5px] border-dashed border-white/10 rounded-xl text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-indigo-400 disabled:cursor-not-allowed"
                                >
                                    <PlusCircle size={18} />
                                    Add another option
                                </button>
                            </div>
                        </div>

                        {/* Submit Footer */}
                        <div className="border-t border-white/10 pt-8 mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 font-medium">Network:</span>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                                    <span className="text-emerald-400 font-bold tracking-widest text-[10px]">TESTNET</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={txStatus === 'PENDING'}
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold px-10 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <Rocket size={18} className={txStatus === 'PENDING' ? 'animate-bounce' : ''} />
                                {txStatus === 'PENDING' ? 'Deploying to Stellar...' : 'Create Poll'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePoll;
