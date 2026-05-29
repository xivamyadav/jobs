'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createJob } from '@/apis/job';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { searchCities, searchSkills, createSkill } from '@/apis/enterprise';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-error';

const JOB_TYPES = [
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Temporary', value: 'temporary' },
];
const WORK_TYPES = ['On-site', 'Remote'];

const EXP_OPTIONS = [
    { value: 0, label: '0 (Fresher)' },
    { value: 1, label: '1 Year' },
    { value: 2, label: '2 Years' },
    { value: 3, label: '3 Years' },
    { value: 4, label: '4 Years' },
    { value: 5, label: '5 Years' },
    { value: 6, label: '6 Years' },
    { value: 7, label: '7 Years' },
    { value: 8, label: '8 Years' },
    { value: 10, label: '10+ Years' },
    { value: 15, label: '15+ Years' },
];

const RECOMMENDED_SKILLS = ['Python', 'Java', 'React.js', 'JavaScript', 'Node.js', 'SQL', '.NET', 'AWS', 'Docker', 'TypeScript', 'MongoDB', 'Django'];

type SkillItem = { id: number | null; name: string };

export default function NewJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState<SkillItem[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        job_type: 'full-time',
        work_type: 'On-site',
        salary_min: '',
        salary_max: '',
        experience_min: 0,
        experience_max: 1,
        qualifications: '',
    });

    const [cityQuery, setCityQuery] = useState('');
    const [cityResults, setCityResults] = useState<any[]>([]);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ id: number; label: string } | null>(null);

    const [skillResults, setSkillResults] = useState<any[]>([]);
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await apiClient.get('/company/my_company/');
                setCompanyInfo(res.data?.data || res.data);
            } catch (e) {
                // Company info is optional for display
            }
        };
        fetchCompany();
    }, []);

    // Location search effect
    useEffect(() => {
        if (!cityQuery || cityQuery.length < 2 || cityQuery === selectedLocation?.label) {
            setCityResults([]);
            setShowCityDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const data = await searchCities(cityQuery);
                setCityResults(data.results || []);
                setShowCityDropdown(true);
            } catch (err) {
                const msg = getApiErrorMessage(err, 'Unable to search cities.');
                toast.error(msg);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [cityQuery, selectedLocation]);

    // Skill search effect
    useEffect(() => {
        if (!skillInput || skillInput.length < 2) {
            setSkillResults([]);
            setShowSkillDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const results = await searchSkills(skillInput);
                setSkillResults(results || []);
                setShowSkillDropdown(true);
            } catch (err) {
                const msg = getApiErrorMessage(err, 'Unable to search skills.');
                toast.error(msg);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [skillInput]);

    const addSkill = (skill: SkillItem) => {
        const trimmed = skill.name.trim();
        if (trimmed && !skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
            setSkills([...skills, { id: skill.id ?? null, name: trimmed }]);
        }
        setSkillInput('');
        setShowSkillDropdown(false);
    };

    const removeSkill = (skillName: string) => {
        setSkills(skills.filter(s => s.name !== skillName));
    };

    const addSkillFromInput = async () => {
        const name = skillInput.trim();
        if (!name) return;
        if (skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            setSkillInput('');
            return;
        }
        try {
            const created = await createSkill(name);
            if (created?.skill_id) {
                addSkill({ id: created.skill_id, name: created.skill_name || name });
                return;
            }
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Unable to create skill.');
            toast.error(msg);
        }
        addSkill({ id: null, name });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            void addSkillFromInput();
        }
    };

    const handleSubmit = async (asDraft: boolean = false) => {
        if (!formData.title.trim()) {
            toast.error('Job title is required');
            return;
        }
        setLoading(true);
        try {
            await createJob({
                title: formData.title,
                description: formData.description,
                location: selectedLocation?.id ?? null,
                job_type: formData.job_type,
                is_remote: formData.work_type === 'Remote',
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                experience_min: formData.experience_min,
                experience_max: formData.experience_max,
                required_skills: skills.map(s => s.id ?? s.name),
                qualifications: formData.qualifications,
                status: asDraft ? 'draft' : 'published',
            });
            toast.success(asDraft ? 'Job saved as draft!' : 'Job published successfully!');
            router.push('/employer/jobs');
        } catch (error: any) {
            const msg = getApiErrorMessage(error, 'Failed to post job.');
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Post Job</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">
                {/* Company Info */}
                {companyInfo && (
                    <div className="flex items-center gap-4">
                        {companyInfo.logo ? (
                            <img src={companyInfo.logo} alt={companyInfo.name} className="w-12 h-12 rounded-lg object-contain border border-gray-100" />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                                {companyInfo.name?.charAt(0) || 'C'}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">{companyInfo.name || 'Company'}</h3>
                                {companyInfo.is_verified && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* Job Title */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Job Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Senior Full Stack Developer"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Row 1: Job Type | Min Exp | Max Exp */}
                    <div className="md:col-span-6 xl:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Job Type</label>
                        <div className="flex flex-wrap gap-2">
                            {JOB_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData({...formData, job_type: type.value})}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                        formData.job_type === type.value
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="md:col-span-3 xl:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Min Experience</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-indigo-500 focus:outline-none"
                            value={formData.experience_min}
                            onChange={e => setFormData({...formData, experience_min: parseInt(e.target.value)})}
                        >
                            {EXP_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3 xl:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Max Experience</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-indigo-500 focus:outline-none"
                            value={formData.experience_max}
                            onChange={e => setFormData({...formData, experience_max: parseInt(e.target.value)})}
                        >
                            {EXP_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Row 2: Work Type | Location | Salary Range */}
                    <div className="md:col-span-6 xl:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Work Type</label>
                        <div className="flex gap-2">
                            {WORK_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, work_type: type})}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                        formData.work_type === type
                                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-slate-300'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-6 xl:col-span-4 relative">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Location</label>
                        <input
                            type="text"
                            placeholder="Add location..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
                            value={cityQuery}
                            onChange={e => {
                                setCityQuery(e.target.value);
                                if (selectedLocation) setSelectedLocation(null);
                            }}
                            onFocus={() => { if (cityQuery) setShowCityDropdown(true) }}
                            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                        />
                        <AnimatePresence>
                            {showCityDropdown && cityResults.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-[105%] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <div className="max-h-60 overflow-y-auto">
                                        {cityResults.map(city => (
                                            <div
                                                key={city.id}
                                                className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSelectedLocation({ id: city.id, label: city.label });
                                                    setCityQuery(city.label);
                                                    setShowCityDropdown(false);
                                                }}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-500"><MapPin size={15} /></div>
                                                <div>
                                                    <div className="text-[13px] font-semibold text-gray-900">{city.city}</div>
                                                    <div className="text-[11px] text-gray-500">{city.state}, {city.country}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="md:col-span-12 xl:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Salary Range (INR - LPA)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Min"
                                    className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm"
                                    value={formData.salary_min}
                                    onChange={e => setFormData({...formData, salary_min: e.target.value})}
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Max"
                                    className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm"
                                    value={formData.salary_max}
                                    onChange={e => setFormData({...formData, salary_max: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Skills */}
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-3 block">Key skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {skills.map(skill => (
                            <span key={`${skill.id ?? 'name'}-${skill.name}`} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                                {skill.name}
                                <button onClick={() => removeSkill(skill.name)} className="hover:text-red-500 ml-1">&times;</button>
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type a skill, press Enter..."
                            className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none text-sm"
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => { if (skillInput) setShowSkillDropdown(true) }}
                            onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                        />
                        <AnimatePresence>
                            {showSkillDropdown && skillResults.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-[105%] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <div className="max-h-60 overflow-y-auto">
                                        {skillResults.map(skill => (
                                            <div
                                                key={skill.skill_id || skill.id}
                                                className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    addSkill({
                                                        id: skill.skill_id || skill.id || null,
                                                        name: skill.skill_name || skill.name
                                                    });
                                                }}
                                            >
                                                <div className="text-[13px] font-semibold text-gray-900 px-2">{skill.skill_name || skill.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Recommended Skills */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Recommended Skills</label>
                    <div className="flex flex-wrap gap-2">
                        {RECOMMENDED_SKILLS.filter(s => !skills.some(k => k.name === s)).map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => addSkill({ id: null, name: skill })}
                                className="px-4 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>

                {/* About the role */}
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-3 block">About the role</label>
                    <textarea
                        rows={8}
                        placeholder="Describe the role and what you're looking for..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm resize-none"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-3 block">Qualifications / Requirements</label>
                    <textarea
                        rows={6}
                        placeholder="Mention required qualifications, certifications, or must-have skills..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm resize-none"
                        value={formData.qualifications}
                        onChange={e => setFormData({...formData, qualifications: e.target.value})}
                    />
                </div>
            </div>
        </div>
    );
}
