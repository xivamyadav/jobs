'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Loader2, Save, Globe, MapPin, FileText, Linkedin,
    Upload, X, RotateCw, Sparkles, Building2, Mail, CheckCircle2,
    Briefcase, Eye, BarChart2, ExternalLink, Compass, Map, ChevronRight, Info,
    Trash2, Edit, Camera, Sliders
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/lib/api/company'
import { companyKeys } from '@/lib/hooks/useCompanyProfile'
import { searchCities } from '@/apis/enterprise'
import type { Company } from '@/lib/types/company'

import styles from './company.module.css'

interface FormCompany extends Partial<Company> {
    companySize?: string
    foundedYear?: number
    location?: string
    about?: string
    socialLinks?: { linkedin?: string, twitter?: string, github?: string }
    stage?: string
    tagline?: string
    techStack?: string[]
    benefits?: string[]
    logo_crop_data?: { zoom: number; rotate: number; yOffset: number }
    banner_crop_data?: { zoom: number; rotate: number; yOffset: number }
}

const ALL_BENEFITS = [
    { id: 'remote', label: 'Remote First' },
    { id: 'hybrid', label: 'Hybrid Office' },
    { id: 'flexible', label: 'Flexible Hours' },
    { id: 'stock', label: 'Stock Options' },
    { id: 'learning', label: 'L&D Budget' },
    { id: 'health', label: 'Health Cover' },
    { id: 'holidays', label: 'Paid Holidays' },
    { id: 'meals', label: 'Free Meals' },
    { id: 'growth', label: 'Fast Growth' },
]

export default function CompanyProfilePage() {
    const queryClient = useQueryClient()
    const [company, setCompany] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // File upload references
    const logoInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)
    const logoMenuRef = useRef<HTMLDivElement>(null)

    // Form states
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string>('')
    const [formData, setFormData] = useState<FormCompany>({
        techStack: [],
        benefits: [],
        socialLinks: {}
    })
    const [unsavedChanges, setUnsavedChanges] = useState(false)

    // Crop adjustment states
    const [showCropPanel, setShowCropPanel] = useState(false)
    const [cropTarget, setCropTarget] = useState<'logo' | 'banner'>('logo')
    const [logoZoom, setLogoZoom] = useState(1.0)
    const [logoRotate, setLogoRotate] = useState(0)
    const [logoYOffset, setLogoYOffset] = useState(0)
    const [bannerZoom, setBannerZoom] = useState(1.0)
    const [bannerRotate, setBannerRotate] = useState(0)
    const [bannerYOffset, setBannerYOffset] = useState(0)

    // Dropdown options popup state
    const [logoMenuOpen, setLogoMenuOpen] = useState(false)

    // Location Autocomplete states
    const [cityQuery, setCityQuery] = useState('')
    const [cityResults, setCityResults] = useState<any[]>([])
    const [showCityDropdown, setShowCityDropdown] = useState(false)
    const [isLoadingCities, setIsLoadingCities] = useState(false)

    // Tag Input State
    const [techInput, setTechInput] = useState('')

    // Load company data
    useEffect(() => {
        const loadCompany = async () => {
            try {
                setLoading(true)
                const res = await companyApi.getMyCompany() as any
                const data = res?.data || res
                setCompany(data)

                const locationVal = data.location || data.address || ''
                setFormData({
                    name: data.name || '',
                    industry: data.industry || '',
                    companySize: data.company_size || data.companySize || '',
                    foundedYear: data.founded_year || '',
                    stage: data.stage || '',
                    tagline: data.tagline || '',
                    website: data.website || '',
                    location: locationVal,
                    about: data.about || data.description || '',
                    email: data.email || '',
                    socialLinks: data.socialLinks || data.social_links || {
                        linkedin: data.linkedin_url || '',
                        twitter: data.twitter_url || '',
                        github: data.github_url || ''
                    },
                    techStack: data.tech_stack || [],
                    benefits: data.benefits || [],
                    logo_crop_data: data.logo_crop_data || { zoom: 1.0, rotate: 0, yOffset: 0 },
                    banner_crop_data: data.banner_crop_data || { zoom: 1.0, rotate: 0, yOffset: 0 }
                })
                setCityQuery(locationVal)

                if (data?.logo_url) {
                    setLogoPreview(data.logo_url)
                } else if (data?.logo) {
                    setLogoPreview(data.logo)
                }

                if (data?.banner_url) {
                    setBannerPreview(data.banner_url)
                } else if (data?.banner) {
                    setBannerPreview(data.banner)
                }

                // Restore crop metadata
                if (data?.logo_crop_data) {
                    setLogoZoom(data.logo_crop_data.zoom || 1.0)
                    setLogoRotate(data.logo_crop_data.rotate || 0)
                    setLogoYOffset(data.logo_crop_data.yOffset || 0)
                }
                if (data?.banner_crop_data) {
                    setBannerZoom(data.banner_crop_data.zoom || 1.0)
                    setBannerRotate(data.banner_crop_data.rotate || 0)
                    setBannerYOffset(data.banner_crop_data.yOffset || 0)
                }

            } catch (err: any) {
                const msg = getApiErrorMessage(err, 'Unable to load company profile.')
                toast.error(msg)
            } finally {
                setLoading(false)
            }
        }
        loadCompany()
    }, [])

    // Close logo dropdown and city suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (logoMenuRef.current && !logoMenuRef.current.contains(e.target as Node)) {
                setLogoMenuOpen(false)
            }
            setShowCityDropdown(false)
        }
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    // Debounced location search effect
    useEffect(() => {
        if (!cityQuery || cityQuery.length < 2 || cityQuery === formData.location) {
            setCityResults([]);
            setShowCityDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            setIsLoadingCities(true);
            try {
                const data = await searchCities(cityQuery);
                const responseResults = data.results || [];
                setCityResults(responseResults);
                setShowCityDropdown(true);
            } catch (err) {
                const msg = getApiErrorMessage(err, 'Unable to search cities.');
                toast.error(msg);
            } finally {
                setIsLoadingCities(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [cityQuery]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            if (field.includes('.')) {
                const [parent, child] = field.split('.')
                return {
                    ...prev,
                    [parent]: {
                        ...(prev[parent as keyof FormCompany] as any),
                        [child]: value
                    }
                }
            }
            return { ...prev, [field]: value }
        })
        setUnsavedChanges(true)
    }

    const toggleBenefit = (benefitId: string) => {
        const current = formData.benefits || []
        const newBenefits = current.includes(benefitId)
            ? current.filter(id => id !== benefitId)
            : [...current, benefitId]
        handleInputChange('benefits', newBenefits)
    }

    const addTechTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && techInput.trim()) {
            e.preventDefault()
            if (!formData.techStack?.includes(techInput.trim())) {
                handleInputChange('techStack', [...(formData.techStack || []), techInput.trim()])
            }
            setTechInput('')
        }
    }

    const removeTechTag = (tag: string) => {
        handleInputChange('techStack', (formData.techStack || []).filter(t => t !== tag))
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Logo must be less than 2MB')
            return
        }

        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            toast.error('Logo must be PNG or JPG')
            return
        }

        setLogoFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setLogoPreview(reader.result as string)
            setLogoZoom(1.0)
            setLogoRotate(0)
            setLogoYOffset(0)
            setCropTarget('logo')
            setShowCropPanel(true)
        }
        reader.readAsDataURL(file)
        setUnsavedChanges(true)
    }

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Banner must be less than 2MB')
            return
        }

        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            toast.error('Banner must be PNG or JPG')
            return
        }

        setBannerFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setBannerPreview(reader.result as string)
            setBannerZoom(1.0)
            setBannerRotate(0)
            setBannerYOffset(0)
            setCropTarget('banner')
            setShowCropPanel(true)
        }
        reader.readAsDataURL(file)
        setUnsavedChanges(true)
    }

    const handleLogoCircleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (logoPreview) {
            setLogoMenuOpen(!logoMenuOpen)
        } else {
            logoInputRef.current?.click()
        }
    }

    const removeLogo = () => {
        setLogoPreview('')
        setLogoFile(null)
        setLogoZoom(1.0)
        setLogoRotate(0)
        setLogoYOffset(0)
        setLogoMenuOpen(false)
        setUnsavedChanges(true)
    }

    const removeBanner = () => {
        setBannerPreview('')
        setBannerFile(null)
        setBannerZoom(1.0)
        setBannerRotate(0)
        setBannerYOffset(0)
        setUnsavedChanges(true)
    }

    const handleCancel = () => {
        window.location.reload()
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            if (!formData.name || formData.name.trim().length < 2) {
                toast.error('Company name is required (min 2 chars)')
                setSaving(false)
                return
            }

            if (!formData.email || !formData.email.trim()) {
                toast.error('Company email is required')
                setSaving(false)
                return
            }

            if (logoFile) {
                try {
                    const logoData = await companyApi.uploadLogo(logoFile)
                    if (logoData?.logo_url) {
                        setLogoPreview(logoData.logo_url)
                    } else if (logoData?.logo) {
                        setLogoPreview(logoData.logo)
                    }
                    setLogoFile(null)
                } catch (logoErr: any) {
                    const msg = getApiErrorMessage(logoErr, 'Logo upload failed.');
                    toast.error(msg);
                }
            }

            if (bannerFile) {
                try {
                    const bannerData = await companyApi.uploadBanner(bannerFile)
                    if (bannerData?.banner_url) {
                        setBannerPreview(bannerData.banner_url)
                    } else if (bannerData?.banner) {
                        setBannerPreview(bannerData.banner)
                    }
                    setBannerFile(null)
                } catch (bannerErr: any) {
                    const msg = getApiErrorMessage(bannerErr, 'Banner upload failed.');
                    toast.error(msg);
                }
            }

            const backendData = {
                name: formData.name || '',
                email: formData.email || '',
                industry: formData.industry || '',
                company_size: formData.companySize || '',
                founded_year: formData.foundedYear || null,
                stage: formData.stage || '',
                tagline: formData.tagline || '',
                website: formData.website || '',
                location: formData.location || '',
                about: formData.about || '',
                socialLinks: formData.socialLinks,
                tech_stack: formData.techStack,
                benefits: formData.benefits,
                logo: logoPreview ? undefined : null,
                banner: bannerPreview ? undefined : null,
                // Save crop configurations persistently
                logo_crop_data: { zoom: logoZoom, rotate: logoRotate, yOffset: logoYOffset },
                banner_crop_data: { zoom: bannerZoom, rotate: bannerRotate, yOffset: bannerYOffset }
            }

            const updatedCompany = await companyApi.updateMyCompany(backendData) as any

            setUnsavedChanges(false)
            setShowCropPanel(false)
            queryClient.invalidateQueries({ queryKey: companyKeys.detail() })
            toast.success('Company profile updated successfully!')
        } catch (err: any) {
            const msg = getApiErrorMessage(err, 'Failed to save changes.');
            toast.error(msg)
        } finally {
            setSaving(false)
        }
    }

    // Calculate completion progress for profile tag
    const calculateCompletion = () => {
        const requiredFields = [
            formData.name,
            formData.email,
            formData.industry,
            formData.companySize,
            formData.location,
            formData.website,
            formData.about,
            logoPreview
        ]
        const filled = requiredFields.filter(f => f && String(f).trim().length > 0).length
        return Math.round((filled / requiredFields.length) * 100)
    }

    const completionStatus = calculateCompletion()

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-[#F8FAFC]">
                <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-[#5B4DFF] animate-spin" />
                    <Building2 className="absolute text-[#5B4DFF] animate-pulse" size={24} />
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <header className={styles.topHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.consoleBadge}>
                        <div className={styles.consoleBadgeDot}></div>
                        Employer Console
                    </div>
                    <h1 className={styles.headerTitle}>Company Profile</h1>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={handleCancel} className={styles.btnGhost}>Discard Changes</button>
                    <button onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Workspace
                    </button>
                </div>
            </header>

            <div className={styles.pageContent}>
                <div className={styles.contentMain}>

                    {/* HERO CARD */}
                    <div className={`${styles.heroCard} ${styles.animatedCard1}`}>
                        <div className={styles.heroBg} style={{ overflow: 'hidden', position: 'relative' }}>
                            {bannerPreview ? (
                                <img
                                    src={bannerPreview}
                                    alt="Banner"
                                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                                    style={{ transform: `scale(${bannerZoom}) rotate(${bannerRotate}deg) translateY(${bannerYOffset}px)` }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #0B132B 0%, #1C2541 35%, #3A506B 70%, #5B4DFF 100%)` }}>
                                    <span className="text-[120px] font-black text-white/10 tracking-[0.2em] uppercase pointer-events-none select-none">
                                        ByteBuzz
                                    </span>
                                </div>
                            )}

                            {/* Hover overlay for changing/deleting banner */}
                            <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/0 hover:bg-black/40 transition-all group z-10">
                                <button
                                    type="button"
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-white bg-black/60 hover:bg-black/85 px-4 py-2.5 rounded-xl backdrop-blur-md transition-all font-bold text-xs border border-white/10 shadow-lg cursor-pointer"
                                >
                                    <Upload size={14} /> Upload Cover Banner
                                </button>

                                {bannerPreview && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeBanner();
                                        }}
                                        className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-white bg-red-600/80 hover:bg-red-600 px-4 py-2.5 rounded-xl backdrop-blur-md transition-all font-bold text-xs border border-white/10 shadow-lg cursor-pointer"
                                    >
                                        <Trash2 size={14} /> Delete Banner
                                    </button>
                                )}
                                <input type="file" accept="image/*" onChange={handleBannerChange} ref={bannerInputRef} className="hidden" />
                            </div>

                            <div className={styles.heroStars} style={{ zIndex: 12 }}>
                                <div className={styles.heroStar}></div>
                                <div className={styles.heroStar} style={{ width: '5px', height: '5px', opacity: 0.3 }}></div>
                                <div className={styles.heroStar} style={{ opacity: 0.2 }}></div>
                            </div>

                            {/* <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 12, marginBottom: '16px' }}>
                                <div className={styles.glassBadge}>
                                    <svg width="10" height="10" fill="rgba(255,255,255,0.7)" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" /></svg>
                                    Hiring Active
                                </div>
                                <div className={styles.glassBadge}>
                                    <svg width="10" height="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                    Fresher-Friendly
                                </div>
                            </div> */}
                        </div>

                        <div className={styles.heroBottom}>
                            <div
                                className={styles.logoUploadWrapper}
                                ref={logoMenuRef}
                                onMouseEnter={() => { if (logoPreview) setLogoMenuOpen(true); }}
                                onMouseLeave={() => setLogoMenuOpen(false)}
                            >
                                <div className={styles.logoUploadCircle} onClick={handleLogoCircleClick}>
                                    {logoPreview ? (
                                        <>
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1 select-none pointer-events-none" style={{ transform: `scale(${logoZoom}) rotate(${logoRotate}deg) translateY(${logoYOffset}px)` }} />
                                            {/* Hover overlay inside the circle to display Camera/Edit indicator */}
                                            <div className="absolute inset-0 bg-black/35 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                                                <Camera className="text-white" size={20} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className={styles.logoPlaceholder}>
                                            <Building2 size={24} className="opacity-40 text-[#5B4DFF]" />
                                            <span>Upload Logo</span>
                                        </div>
                                    )}
                                </div>

                                <input type="file" accept="image/*" onChange={handleLogoChange} ref={logoInputRef} className="hidden" />

                                {/* Popover options menu for Logo actions */}
                                <AnimatePresence>
                                    {logoMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, x: -10, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, x: -10, y: 10 }}
                                            className="absolute left-[105%] bottom-2 ml-3 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2.5 z-40 min-w-[160px] flex flex-col gap-1"
                                        >
                                            <button
                                                onClick={() => { setLogoMenuOpen(false); logoInputRef.current?.click(); }}
                                                className="flex items-center gap-2.5 text-left w-full px-3 py-2 rounded-xl text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Upload size={14} className="text-slate-400" /> Update Logo
                                            </button>
                                            <button
                                                onClick={() => { setLogoMenuOpen(false); setCropTarget('logo'); setShowCropPanel(true); }}
                                                className="flex items-center gap-2.5 text-left w-full px-3 py-2 rounded-xl text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Sliders size={14} className="text-[#5B4DFF]" /> Adjust Crop
                                            </button>
                                            <div className="h-[1px] bg-slate-100 my-1"></div>
                                            <button
                                                onClick={removeLogo}
                                                className="flex items-center gap-2.5 text-left w-full px-3 py-2 rounded-xl text-[12px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={14} /> Remove Logo
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className={styles.profileInfo}>
                                <div className={styles.profileName}>
                                    {formData.name || 'Your Company Name'}
                                    <div className={styles.verifiedBadge}>
                                        <CheckCircle2 size={12} className="text-white fill-transparent" />
                                    </div>
                                </div>
                                <div className={styles.profileMeta}>
                                    <div className={`${styles.metaChip} ${!formData.location && styles.pending}`}>
                                        <MapPin size={14} /> {formData.location || 'Location unspecified'}
                                    </div>
                                    <div className={styles.metaDot}></div>
                                    <div className={`${styles.metaChip} ${!formData.industry && styles.pending}`}>
                                        <Briefcase size={14} /> {formData.industry || 'Industry unspecified'}
                                    </div>
                                    <div className={styles.metaDot}></div>
                                    <div className={styles.metaChip}>
                                        <Building2 size={14} /> {formData.companySize || 'Size unspecified'}
                                    </div>
                                </div>
                                <div className={styles.profileTags}>
                                    {completionStatus < 100 ? (
                                        <div className={styles.tag}>✦ Profile incomplete</div>
                                    ) : (
                                        <div className={styles.tag} style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderColor: 'rgba(34,197,94,0.2)' }}>✦ All Set!</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BASIC IDENTIFICATION CARD */}
                    <div className={`${styles.formCard} ${styles.animatedCard2}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconWrap}>
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <div className={styles.cardTitle}>Basic Identification</div>
                                <div className={styles.cardSubtitle}>Core brand tags that define your venture's identity</div>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Company / Brand Name <span className={styles.req}>*</span></label>
                                    <div className={styles.fieldWrapper}>
                                        <div className={styles.fieldIcon}><Building2 size={15} /></div>
                                        <input className={styles.formInput} type="text" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} placeholder="e.g. Acme Corp" />
                                    </div>
                                </div>

                                <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Core Industry <span className={styles.req}>*</span></label>
                                        <div className={styles.fieldWrapper}>
                                            <div className={styles.fieldIcon}><Briefcase size={15} /></div>
                                            <select className={styles.formSelect} value={formData.industry || ''} onChange={e => handleInputChange('industry', e.target.value)}>
                                                <option value="" disabled>Select industry...</option>
                                                <option value="Software Development">Software Development / IT</option>
                                                <option value="Fintech">Fintech</option>
                                                <option value="E-commerce">E-commerce</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Education">Education</option>
                                                <option value="Media & Entertainment">Media & Entertainment</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                                <option value="Consulting">Consulting</option>
                                            </select>
                                            <div className={styles.selectArrow}><ChevronRight size={14} className="rotate-90" /></div>
                                        </div>
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Employee Count</label>
                                        <div className={styles.fieldWrapper}>
                                            <div className={styles.fieldIcon}><Building2 size={15} /></div>
                                            <select className={styles.formSelect} value={formData.companySize || ''} onChange={e => handleInputChange('companySize', e.target.value)}>
                                                <option value="" disabled>Select size...</option>
                                                <option value="1-10 employees">1–10 · Startup</option>
                                                <option value="11-50 employees">11–50 · Early stage</option>
                                                <option value="51-200 employees">51–200 · Growth</option>
                                                <option value="201-500 employees">201–500 · Scale-up</option>
                                                <option value="500-1000 employees">500–1000 · Enterprise</option>
                                                <option value="1000+ employees">1000+ · Corporation</option>
                                            </select>
                                            <div className={styles.selectArrow}><ChevronRight size={14} className="rotate-90" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>HQ Address / Location <span className={styles.req}>*</span></label>
                                    <div className={styles.locationWrapper}>
                                        <div className={styles.fieldWrapper}>
                                            <div className={styles.fieldIcon} style={{ color: 'var(--p1)' }}><MapPin size={15} /></div>
                                            <input
                                                className={styles.formInput}
                                                type="text"
                                                placeholder="Type a city name... e.g. Noida, Bengaluru"
                                                value={cityQuery}
                                                onChange={e => {
                                                    setCityQuery(e.target.value)
                                                    if (formData.location) handleInputChange('location', '')
                                                }}
                                                onFocus={() => { if (cityQuery) setShowCityDropdown(true) }}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {showCityDropdown && cityResults.length > 0 && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-[110%] left-0 right-0 bg-white border-2 border-[var(--border2)] rounded-[var(--radius-md)] shadow-xl z-50 overflow-hidden">
                                                    <div className="p-3 flex justify-between items-center border-b border-[var(--border)]">
                                                        <span className="text-[11px] text-[var(--text3)] font-medium">Suggestions</span>
                                                        <button className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--p1)] hover:bg-[var(--p1)]/10 px-2.5 py-1.5 rounded-lg transition-colors" onClick={() => { handleInputChange('location', 'Noida, Uttar Pradesh, India'); setCityQuery('Noida, Uttar Pradesh, India'); setShowCityDropdown(false) }}>
                                                            <Compass size={13} /> Detect
                                                        </button>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {cityResults.map(city => (
                                                            <div key={city.id} className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[var(--surface2)] cursor-pointer transition-colors" onClick={() => { handleInputChange('location', city.label); setCityQuery(city.label); setShowCityDropdown(false) }}>
                                                                <div className="w-8 h-8 rounded-lg bg-[var(--p1)]/10 flex items-center justify-center shrink-0 text-[var(--p1)]"><MapPin size={15} /></div>
                                                                <div>
                                                                    <div className="text-[13px] font-semibold text-[var(--text1)]">{city.city}</div>
                                                                    <div className="text-[11px] text-[var(--text3)]">{city.state}, {city.country}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Founded Year</label>
                                        <div className={styles.fieldWrapper}>
                                            <div className={styles.fieldIcon}><Building2 size={15} /></div>
                                            <input className={styles.formInput} type="number" placeholder="e.g. 2021" value={formData.foundedYear || ''} onChange={e => handleInputChange('foundedYear', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Company Stage</label>
                                        <div className={styles.fieldWrapper}>
                                            <div className={styles.fieldIcon}><BarChart2 size={15} /></div>
                                            <select className={styles.formSelect} value={formData.stage || ''} onChange={e => handleInputChange('stage', e.target.value)}>
                                                <option value="" disabled>Select stage...</option>
                                                <option value="Bootstrapped">Bootstrapped</option>
                                                <option value="Pre-seed">Pre-seed</option>
                                                <option value="Seed">Seed</option>
                                                <option value="Series A">Series A</option>
                                                <option value="Series B+">Series B+</option>
                                                <option value="Public">Public</option>
                                            </select>
                                            <div className={styles.selectArrow}><ChevronRight size={14} className="rotate-90" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTACT & LINKS CARD */}
                    <div className={`${styles.formCard} ${styles.animatedCard3}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconWrap}><Globe size={20} /></div>
                            <div>
                                <div className={styles.cardTitle}>Contact & Links</div>
                                <div className={styles.cardSubtitle}>How candidates and collaborators can reach you</div>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Corporate Email <span className={styles.req}>*</span></label>
                                        <div className={styles.fieldWrapper}>
                                            <div className={styles.fieldIcon}><Mail size={15} /></div>
                                            <input className={styles.formInput} type="email" placeholder="team@company.com" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Phone Number</label>
                                        <div className={styles.fieldWrapper}>
                                            <div className={styles.fieldIcon}>📞</div>
                                            <input className={styles.formInput} type="tel" placeholder="+91 98765 43210" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Public Website</label>
                                    <div className={styles.fieldWrapper}>
                                        <div className={styles.fieldIcon}><Globe size={15} /></div>
                                        <span className={styles.urlPrefix} style={{ left: '42px' }}>https://</span>
                                        <input className={`${styles.formInput} ${styles.withPrefixSm}`} type="text" placeholder="yourcompany.com" value={(formData.website || '').replace('https://', '').replace('http://', '')} onChange={e => handleInputChange('website', `https://${e.target.value}`)} />
                                    </div>
                                </div>

                                <div className={styles.sectionSep}>
                                    <div className={styles.sepLine}></div>
                                    <div className={styles.sepText}>Social Presence</div>
                                    <div className={styles.sepLine}></div>
                                </div>

                                <div className={styles.formGrid} style={{ gap: '12px' }}>
                                    <div className={styles.socialLinkRow}>
                                        <div className={styles.socialPlatformBadge}>
                                            <svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </div>
                                        <div className={styles.fieldWrapper} style={{ flex: 1 }}>
                                            <span className={styles.urlPrefix} style={{ left: '14px', fontSize: '12px' }}>linkedin.com/company/</span>
                                            <input className={`${styles.formInput} ${styles.withPrefix}`} type="text" placeholder="your-company" style={{ paddingLeft: '178px' }} value={(formData.socialLinks?.linkedin || '').replace('https://linkedin.com/company/', '').replace('https://www.linkedin.com/company/', '')} onChange={e => handleInputChange('socialLinks.linkedin', `https://linkedin.com/company/${e.target.value}`)} />
                                        </div>
                                    </div>
                                    <div className={styles.socialLinkRow}>
                                        <div className={styles.socialPlatformBadge}>
                                            <svg viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z" /></svg>
                                        </div>
                                        <div className={styles.fieldWrapper} style={{ flex: 1 }}>
                                            <span className={styles.urlPrefix} style={{ left: '14px', fontSize: '12px' }}>twitter.com/</span>
                                            <input className={`${styles.formInput} ${styles.withPrefix}`} type="text" placeholder="yourhandle" style={{ paddingLeft: '102px' }} value={(formData.socialLinks?.twitter || '').replace('https://twitter.com/', '')} onChange={e => handleInputChange('socialLinks.twitter', `https://twitter.com/${e.target.value}`)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ABOUT COMPANY CARD */}
                    <div className={`${styles.formCard} ${styles.animatedCard4}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconWrap}><FileText size={20} /></div>
                            <div>
                                <div className={styles.cardTitle}>About Company</div>
                                <div className={styles.cardSubtitle}>Your company's story, mission, and what you're building</div>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Company Tagline <span className={styles.fieldTooltip} title="Shows on public profiles">?</span></label>
                                    <div className={styles.fieldWrapper}>
                                        <div className={styles.fieldIcon}><Info size={15} /></div>
                                        <input className={styles.formInput} type="text" placeholder="e.g. Where great talent meets great teams" value={formData.tagline || ''} onChange={e => handleInputChange('tagline', e.target.value)} />
                                    </div>
                                    <div className={styles.fieldHint}>Keep it under 80 characters · Shows on your public job listings</div>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Company Story / Mission <span className={styles.req}>*</span></label>
                                    <div className={styles.fieldWrapper} style={{ alignItems: 'flex-start' }}>
                                        <div className={styles.fieldIcon} style={{ top: '14px', position: 'absolute' }}><FileText size={15} /></div>
                                        <textarea className={styles.formTextarea} placeholder="Tell candidates what you're building, why you're building it, and what impact you're making..." value={formData.about || ''} onChange={e => handleInputChange('about', e.target.value)}></textarea>
                                    </div>
                                    <div className={styles.fieldHint} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Markdown supported</span>
                                        <span>{(formData.about || '').length} / 2000</span>
                                    </div>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Tech Stack / Keywords</label>
                                    <div className={styles.tagInputWrap}>
                                        {formData.techStack?.map((tag, idx) => (
                                            <div key={idx} className={styles.skillTag}>
                                                {tag} <span className={styles.skillTagX} onClick={() => removeTechTag(tag)}>×</span>
                                            </div>
                                        ))}
                                        <input
                                            className={styles.tagInputField}
                                            placeholder="Add a technology..."
                                            value={techInput}
                                            onChange={e => setTechInput(e.target.value)}
                                            onKeyDown={addTechTag}
                                        />
                                    </div>
                                    <div className={styles.fieldHint}>Press Enter to add · Helps candidates find you by tech keywords</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CULTURE & BENEFITS CARD */}
                    <div className={`${styles.formCard} ${styles.animatedCard5}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconWrap}><Sparkles size={20} /></div>
                            <div>
                                <div className={styles.cardTitle}>Culture & Benefits</div>
                                <div className={styles.cardSubtitle}>Showcase what makes your workplace special</div>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel} style={{ marginBottom: '10px' }}>Work Environment</label>
                                    <div className={styles.benefitsGrid}>
                                        {ALL_BENEFITS.map(benefit => (
                                            <label key={benefit.id} className={`${styles.benefitChip} ${(formData.benefits || []).includes(benefit.id) ? styles.selected : ''}`}>
                                                <input type="checkbox" checked={(formData.benefits || []).includes(benefit.id)} onChange={() => toggleBenefit(benefit.id)} />
                                                <span className={styles.benefitLabel}>{benefit.label}</span>
                                                <div className={styles.chipCheck}>
                                                    <CheckCircle2 size={10} className="text-white fill-transparent" />
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CROP / POSITION MODAL */}
            <AnimatePresence>
                {showCropPanel && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[20px] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                                    <RotateCw size={16} className="text-[#5B4DFF] animate-spin-slow" />
                                    Adjust {cropTarget === 'logo' ? 'Logo' : 'Cover Banner'}
                                </h3>
                                <button
                                    onClick={() => setShowCropPanel(false)}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col items-center gap-6 bg-slate-50/50">
                                {/* Preview Container */}
                                <div className="w-full flex items-center justify-center min-h-[220px]">
                                    {cropTarget === 'logo' ? (
                                        <div className="w-[140px] h-[140px] rounded-[32px] overflow-hidden bg-white border-4 border-white shadow-xl flex items-center justify-center relative">
                                            {logoPreview && (
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo Preview"
                                                    className="w-full h-full object-contain"
                                                    style={{ transform: `scale(${logoZoom}) rotate(${logoRotate}deg) translateY(${logoYOffset}px)` }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-[140px] rounded-[16px] overflow-hidden bg-white border-2 border-slate-200 shadow-md flex items-center justify-center relative">
                                            {bannerPreview && (
                                                <img
                                                    src={bannerPreview}
                                                    alt="Banner Preview"
                                                    className="w-full h-full object-cover"
                                                    style={{ transform: `scale(${bannerZoom}) rotate(${bannerRotate}deg) translateY(${bannerYOffset}px)` }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="w-full space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                                            <span>Zoom</span>
                                            <span>{Math.round((cropTarget === 'logo' ? logoZoom : bannerZoom) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.05"
                                            value={cropTarget === 'logo' ? logoZoom : bannerZoom}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value)
                                                if (cropTarget === 'logo') setLogoZoom(val)
                                                else setBannerZoom(val)
                                            }}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5B4DFF]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                                            <span>Vertical Position (Y-Axis)</span>
                                            <span>{cropTarget === 'logo' ? logoYOffset : bannerYOffset}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-150"
                                            max="150"
                                            step="1"
                                            value={cropTarget === 'logo' ? logoYOffset : bannerYOffset}
                                            onChange={e => {
                                                const val = parseInt(e.target.value)
                                                if (cropTarget === 'logo') setLogoYOffset(val)
                                                else setBannerYOffset(val)
                                            }}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5B4DFF]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                                            <span>Rotate</span>
                                            <span>{cropTarget === 'logo' ? logoRotate : bannerRotate}°</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-180"
                                            max="180"
                                            step="1"
                                            value={cropTarget === 'logo' ? logoRotate : bannerRotate}
                                            onChange={e => {
                                                const val = parseInt(e.target.value)
                                                if (cropTarget === 'logo') setLogoRotate(val)
                                                else setBannerRotate(val)
                                            }}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5B4DFF]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-white">
                                <button
                                    onClick={() => {
                                        if (cropTarget === 'logo') {
                                            setLogoZoom(1.0)
                                            setLogoRotate(0)
                                            setLogoYOffset(0)
                                        } else {
                                            setBannerZoom(1.0)
                                            setBannerRotate(0)
                                            setBannerYOffset(0)
                                        }
                                    }}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-bold text-xs transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowCropPanel(false)}
                                    className="px-5 py-2 bg-[#5B4DFF] hover:bg-[#4F46E5] rounded-xl text-white font-bold text-xs transition-colors shadow-md shadow-indigo-100"
                                >
                                    Apply Fitting
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
