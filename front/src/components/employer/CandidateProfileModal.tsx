import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  X, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Award, FileText, Download, Calendar, ExternalLink,
  MessageSquare, CheckCircle2, User, Code, Layers
} from 'lucide-react'

interface CandidateProfileModalProps {
  applicant: any
  onClose: () => void
}

export function CandidateProfileModal({ applicant, onClose }: CandidateProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'resume'>('profile')
  if (!applicant) return null

  const profile = applicant.candidate_detail || {}

  // ── Extract resume URL (try multiple paths) ──
  const resumeData = profile.resume
  let resumeUrl =
    applicant.resume ||
    resumeData?.resume_url ||
    resumeData?.resume_file ||
    (resumeData?.resume_file ? resumeData.resume_file : null)

  if (resumeUrl && resumeUrl.startsWith('/')) {
    resumeUrl = `http://localhost:8000${resumeUrl}`;
  }

  let profilePicUrl = profile.profile_picture;
  if (profilePicUrl && profilePicUrl.startsWith('/')) {
    profilePicUrl = `http://localhost:8000${profilePicUrl}`;
  }

  // ── Phone number (direct from serializer) ──
  const phoneNumber = profile.phone_number || ''

  // ── Location ──
  const locationParts = [profile.city, profile.state, profile.country].filter(Boolean)
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified'

  // ── Experience formatting ──
  const y = profile.total_experience_years ? parseInt(profile.total_experience_years) : 0
  const m = profile.total_experience_months ? parseInt(profile.total_experience_months) : 0
  const totalMonths = (y * 12) + m
  const displayY = Math.floor(totalMonths / 12)
  const displayM = totalMonths % 12
  const expString = totalMonths > 0 ? `${displayY}y ${displayM}m` : 'Fresher'

  // ── Skills ──
  const skills: any[] = profile.skills || []

  // ── Current job & education ──
  const currentExp = profile.experiences?.find((e: any) => e.is_current) || profile.experiences?.[0]
  const highestEdu = profile.educations?.[0]

  // ── Tabs config ──
  const tabs = [
    { key: 'profile', label: 'Profile Detail', icon: User },
    { key: 'skills', label: 'Key Skills', icon: Code, count: skills.length },
    { key: 'resume', label: 'Attached CV', icon: FileText },
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-10 sm:pt-16 pb-10 px-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="w-full max-w-5xl bg-[#f8f9fb] rounded-xl shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">

        {/* Top Header Actions */}
        <div className="bg-white rounded-t-xl px-6 py-3 border-b border-slate-200 flex items-center justify-between text-sm font-medium text-slate-600">
          <div className="flex items-center gap-6">
            <button className="hover:text-indigo-600 flex items-center gap-1.5"><Briefcase size={16} /> Add to</button>
            <button className="hover:text-indigo-600 flex items-center gap-1.5"><Mail size={16} /> Send Invite</button>
            <button className="hover:text-indigo-600 flex items-center gap-1.5"><Calendar size={16} /> Set reminder</button>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Main Profile Summary Card */}
        <div className="p-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative">
            <div className="flex flex-col md:flex-row gap-6">

              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm flex items-center justify-center bg-indigo-50 text-indigo-600 text-3xl font-bold overflow-hidden">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    applicant.candidate_name?.charAt(0).toUpperCase() || 'C'
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{applicant.candidate_name || 'Anonymous'}</h1>
                    {profile.current_designation && (
                      <p className="text-sm text-slate-500 mt-0.5 font-medium">{profile.current_designation}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mt-2 font-medium">
                      <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-slate-400" /> {expString}</span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1.5">
                        ₹ {profile.current_salary_lpa ? `${profile.current_salary_lpa} LPA` : 'Not specified'}
                        {profile.expected_salary_lpa && <span className="text-slate-500 font-normal">(expects: ₹ {profile.expected_salary_lpa} LPA)</span>}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {locationString}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-indigo-600 font-semibold hover:bg-indigo-50 hidden sm:flex">
                    Save
                  </Button>
                </div>

                {/* Quick info rows */}
                <div className="mt-4 space-y-2 text-sm">
                  {profile.is_fresher ? (
                    <div className="flex gap-2">
                      <span className="text-slate-500 w-24 shrink-0">Current</span>
                      <span className="text-slate-800 font-medium">Fresher</span>
                    </div>
                  ) : currentExp ? (
                    <div className="flex gap-2">
                      <span className="text-slate-500 w-24 shrink-0">Current</span>
                      <span className="text-slate-800 font-medium">
                        {[currentExp.designation || currentExp.job_title, currentExp.company_name_text || currentExp.company_name].filter(Boolean).join(' at ')}
                        {currentExp.start_date ? ` Since ${new Date(currentExp.start_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}` : ''}
                      </span>
                    </div>
                  ) : null}
                  {highestEdu && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 w-24 shrink-0">Highest degree</span>
                      <span className="text-slate-800 font-medium">{highestEdu.degree} {highestEdu.field_of_study ? `- ${highestEdu.field_of_study}` : ''}, {highestEdu.institution_name}</span>
                    </div>
                  )}
                  {profile.notice_period_days != null && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 w-24 shrink-0">Notice period</span>
                      <span className="text-slate-800 font-medium">{profile.notice_period_days === 0 ? 'Immediate Joiner' : `${profile.notice_period_days} Days`}</span>
                    </div>
                  )}
                </div>

                {/* Contact bar — phone number shown directly */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {phoneNumber ? (
                    <>
                      <div className="h-9 px-4 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md font-bold text-sm flex items-center gap-2">
                        <Phone size={16} /> {phoneNumber}
                      </div>
                      <a href={`tel:${phoneNumber}`}>
                        <Button variant="outline" className="h-9 px-4 text-slate-600 border-slate-200 hover:bg-slate-50 font-semibold text-sm flex items-center gap-2">
                          <Phone size={16} /> Call candidate
                        </Button>
                      </a>
                      <a href={`https://wa.me/91${phoneNumber}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="h-9 px-4 text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-semibold text-sm flex items-center gap-2">
                          <MessageSquare size={16} /> WhatsApp
                        </Button>
                      </a>
                    </>
                  ) : (
                    <div className="h-9 px-4 text-slate-400 bg-slate-50 border border-slate-200 rounded-md font-medium text-sm flex items-center gap-2">
                      <Phone size={16} /> Phone not available
                    </div>
                  )}

                  <div className="ml-auto text-sm text-slate-500 flex items-center gap-2 font-medium">
                    <Mail size={16} /> {applicant.candidate_email || profile.email || 'N/A'}
                    <span className="text-emerald-600 flex items-center gap-1 text-xs ml-2 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Graphic */}
            {profile.experiences && profile.experiences.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="relative h-2 bg-slate-100 rounded-full w-full">
                  <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full w-2/3"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-2/3 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Past</span>
                  <span>Recent</span>
                  <span>Current</span>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 flex border-b border-slate-200">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <tab.icon size={16} />
                {tab.label}
                {'count' in tab && tab.count > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Left Content */}
                <div className="lg:col-span-2 space-y-6">

                  {/* About / Summary */}
                  {profile.about && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">Work Summary</h3>
                      <div className="pl-4 border-l-4 border-indigo-500">
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6">Work Experience</h3>
                    {profile.experiences && profile.experiences.length > 0 ? (
                      <div className="space-y-8">
                        {profile.experiences.map((exp: any, idx: number) => (
                          <div key={idx} className="relative pl-6 border-l border-slate-200">
                            <div className="absolute w-3 h-3 bg-white border-2 border-indigo-500 rounded-full -left-[6px] top-1.5"></div>
                            <h4 className="font-bold text-slate-900 text-base">{exp.designation || exp.job_title}</h4>
                            <p className="text-slate-600 font-medium text-sm mt-0.5">{exp.company_name_text || exp.company_name}</p>
                            <p className="text-slate-400 text-xs mt-1.5 font-medium">
                              {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                              {' to '}
                              {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                            </p>
                            {exp.description && <p className="text-slate-600 text-sm mt-3 whitespace-pre-wrap leading-relaxed">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No work experience provided by the candidate.</p>
                    )}
                  </div>

                  {/* Education */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6">Education</h3>
                    {profile.educations && profile.educations.length > 0 ? (
                      <div className="space-y-6">
                        {profile.educations.map((edu: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              <GraduationCap size={20} className="text-slate-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{edu.degree} {edu.field_of_study ? `- ${edu.field_of_study}` : ''}</h4>
                              <p className="text-slate-600 font-medium text-sm mt-0.5">{edu.institution || edu.institution_name}</p>
                              <p className="text-slate-400 text-xs mt-1 font-medium">
                                {edu.start_year || ''} - {edu.end_year || 'Present'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No education details provided.</p>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Certifications</h3>
                    {profile.certifications && profile.certifications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.certifications.map((cert: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{cert.name}</h4>
                            <p className="text-slate-600 text-xs mt-1">{cert.issuing_organization}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-slate-400 font-medium text-xs">
                                {cert.valid_from_month && cert.valid_from_year ? `Issued: ${cert.valid_from_month}/${cert.valid_from_year}` : ''}
                              </span>
                              {cert.url && (
                                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                                  View <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No certifications added.</p>
                    )}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Quick Skills Preview */}
                  {skills.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Code size={16} className="text-indigo-500" /> Top Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 8).map((skill: any, idx: number) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                            {skill.skill_detail?.skill_name || skill.skill_name || skill.name || 'Skill'}
                          </span>
                        ))}
                        {skills.length > 8 && (
                          <button onClick={() => setActiveTab('skills')} className="text-indigo-600 text-xs font-bold hover:underline">
                            +{skills.length - 8} more
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm">
                    <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <FileText size={16} /> Recruiter Notes
                    </h3>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {applicant.employer_notes || 'No notes added for this candidate yet. You can add notes from the applicants list view.'}
                    </p>
                  </div>

                  {/* Contact Card */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <User size={16} className="text-indigo-500" /> Contact Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-slate-700 font-medium">{applicant.candidate_email || profile.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-slate-700 font-medium">{phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-slate-700 font-medium">{locationString}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'skills' && (
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Code size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Key Skills</h3>
                    <p className="text-sm text-slate-500">{skills.length} skill{skills.length !== 1 ? 's' : ''} listed by the candidate</p>
                  </div>
                </div>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default flex items-center gap-2">
                        <Layers size={14} className="text-slate-400" />
                        {skill.skill_detail?.skill_name || skill.skill_name || skill.name || 'Skill'}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Code size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No skills listed</p>
                    <p className="text-sm mt-1">The candidate hasn't added any skills to their profile yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm min-h-[700px] flex flex-col">
                {resumeUrl ? (
                  <div className="flex flex-col h-full w-full flex-1">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Resume Attached</h3>
                        {resumeData?.file_name && (
                          <p className="text-indigo-600 font-medium text-sm mt-0.5">{resumeData.file_name} {resumeData?.file_size_bytes && <span className="text-slate-400">({(resumeData.file_size_bytes / (1024 * 1024)).toFixed(2)} MB)</span>}</p>
                        )}
                      </div>
                      <a href={resumeUrl} download target="_blank" rel="noopener noreferrer">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">
                          <Download size={18} className="mr-2" /> Download
                        </Button>
                      </a>
                    </div>
                    
                    <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 min-h-[600px] relative">
                      <iframe 
                        src={`${resumeUrl}${resumeUrl.includes('?') ? '&' : '?'}t=${Date.now()}#toolbar=1&navpanes=0&scrollbar=1`}
                        className="w-full h-full absolute inset-0"
                        title="Candidate Resume"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="m-auto max-w-md w-full space-y-4 text-center py-12">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
                      <FileText size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Resume Available</h3>
                    <p className="text-slate-500 text-sm">This candidate has not uploaded a resume yet or it was not provided during the application process.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
