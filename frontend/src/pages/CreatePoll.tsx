import React, { useState } from 'react';
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
        <div className="max-w-3xl mx-auto w-full pb-10 fade-in">
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Create New Poll</h1>
                <PlusCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm text-slate-400 mb-8">
                Deploy a brand new poll on the Stellar Testnet in seconds.
            </p>

            <form onSubmit={handleSubmit} className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 shadow-xl">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Poll Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What is your favorite Web3 Ecosystem?"
                        className="w-full bg-[#111129] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="space-y-4 mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Options</label>
                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 bg-[#111129] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-50"
                                disabled={options.length <= 2}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mt-2 transition-colors"
                    >
                        <PlusCircle size={16} />
                        Add another option
                    </button>
                </div>

                <div className="border-t border-white/10 pt-6 mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        Network: <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold tracking-wider text-[10px]">TESTNET</span>
                    </div>
                    <button
                        type="submit"
                        disabled={txStatus === 'PENDING'}
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-medium px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Rocket size={16} />
                        {txStatus === 'PENDING' ? 'Deploying to Stellar...' : 'Create Poll'}
                    </button>
                </div>
            </form>
        </div>
    );
};
