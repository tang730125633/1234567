
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GradeGroup, TimetableTheme, TimetableData, SavedTimetable, Course, CustomStyles, FontFamily, BorderStyle, BorderRadius, DaySchedule } from './types';
import { THEMES, MOTTO_OPTIONS } from './constants';
import { generateTimetableData } from './services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// --- Constants for Motifs ---
const AVAILABLE_MOTIFS = [
  { id: 'unicorn', emoji: '🦄', label: '独角兽' },
  { id: 'dino', emoji: '🦖', label: '恐龙' },
  { id: 'ultraman', emoji: '🦸', label: '奥特曼' },
  { id: 'fairy', emoji: '🧚', label: '花仙子' },
  { id: 'doraemon', emoji: '🐱', label: '叮当' },
  { id: 'saint-seiya', emoji: '🛡️', label: '圣斗士' },
  { id: 'fox', emoji: '🦊', label: '狐尼克' },
  { id: 'rabbit', emoji: '🐰', label: '兔朱迪' },
  { id: 'panda', emoji: '🐼', label: '大熊猫' },
  { id: 'rocket', emoji: '🚀', label: '小火箭' },
  { id: 'sun', emoji: '☀️', label: '小太阳' },
  { id: 'rainbow', emoji: '🌈', label: '彩虹' },
];

// --- Subcomponents ---

const Header: React.FC = () => (
  <header className="bg-white border-b border-gray-200 py-6 px-4 mb-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span className="text-blue-600">KidSchedule</span>
          <span className="text-gray-400 font-light">AI</span>
        </h1>
        <p className="text-gray-500 mt-1 font-medium">智能儿童电子课表 & 深度个性化设计</p>
      </div>
      <div className="flex gap-2">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">Designer Edition</span>
        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">v3.0</span>
      </div>
    </div>
  </header>
);

const TimetableCard = React.forwardRef<HTMLDivElement, { data: TimetableData; customStyles: CustomStyles; userTitle: string; selectedMotto: string }>(({ data, customStyles, userTitle, selectedMotto }, ref) => {
  const fontClass = {
    sans: 'font-sans',
    rounded: 'font-sans rounded-font',
    serif: 'font-serif',
    mono: 'font-mono'
  }[customStyles.fontFamily];

  const radiusClass = {
    none: 'rounded-none',
    md: 'rounded-md',
    xl: 'rounded-2xl',
    '3xl': 'rounded-[3rem]'
  }[customStyles.borderRadius];

  const cardStyle: React.CSSProperties = {
    backgroundColor: customStyles.primaryColor,
    borderColor: customStyles.accentColor,
    borderStyle: customStyles.borderStyle,
    color: customStyles.textColor,
    fontFamily: customStyles.fontFamily === 'rounded' ? '"Noto Sans SC", sans-serif' : undefined
  };

  const displayTitle = userTitle || data.title || "我的课表";
  const displayMotto = selectedMotto || data.motto;

  return (
    <div 
      ref={ref} 
      style={cardStyle}
      className={`shadow-2xl overflow-hidden border-4 transition-all duration-300 p-8 ${fontClass} ${radiusClass} relative`}
    >
      {/* Dynamic Background Pattern based on BorderStyle */}
      {customStyles.borderStyle === 'double' && (
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(${customStyles.accentColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
      )}

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: customStyles.accentColor }}>{displayTitle}</h2>
          <div className="h-1.5 w-16 mt-2 rounded-full" style={{ backgroundColor: customStyles.accentColor }}></div>
        </div>
        <div className="text-6xl animate-bounce-slow" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.15))' }}>
          {customStyles.motif}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 relative z-10">
        {data.weekSchedule.map((day, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div 
              className="rounded-lg py-2 px-3 text-center font-black text-sm uppercase tracking-widest shadow-sm"
              style={{ backgroundColor: customStyles.accentColor, color: customStyles.primaryColor }}
            >
              {day.day}
            </div>
            {day.courses.map((course, cIdx) => (
              <div 
                key={cIdx} 
                className="bg-white/40 backdrop-blur-md hover:bg-white/80 transition-all rounded-xl p-4 shadow-sm border border-transparent hover:scale-[1.02] cursor-default"
                style={{ borderColor: `${customStyles.accentColor}20` }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-2xl flex-shrink-0">{course.icon || '📖'}</span>
                  <span className="font-bold text-sm break-words leading-tight pt-1">{course.name}</span>
                </div>
                <div className="text-[10px] font-medium opacity-80 flex flex-col gap-0.5 ml-8">
                  <span className="flex items-center gap-1">🕒 {course.time}</span>
                  {course.teacher && <span className="flex items-center gap-1">👩‍🏫 {course.teacher}</span>}
                  {course.classroom && <span className="flex items-center gap-1">📍 {course.classroom}</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {displayMotto && (
        <div className="mt-10 pt-6 border-t relative z-10" style={{ borderColor: `${customStyles.accentColor}30` }}>
          <div className="text-center italic text-sm font-bold mt-4 opacity-70">
            "{displayMotto}"
          </div>
        </div>
      )}
    </div>
  );
});

// --- Main App ---

type RecordingTarget = 'main' | null;

export default function App() {
  const [gradeGroup, setGradeGroup] = useState<GradeGroup>(GradeGroup.LOW);
  const [selectedTheme, setSelectedTheme] = useState<TimetableTheme>(THEMES[0]);
  const [customStyles, setCustomStyles] = useState<CustomStyles>(THEMES[0].defaultStyles);
  
  // Basic Info state
  const [studentName, setStudentName] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('第一学期');
  const [selectedMotto, setSelectedMotto] = useState(MOTTO_OPTIONS[0]);

  // Document scan state
  const [uploadedFile, setUploadedFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<TimetableData | null>(null);
  const [oralDescription, setOralDescription] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<RecordingTarget>(null);
  
  const [savedSchedules, setSavedSchedules] = useState<SavedTimetable[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  
  const [editingSchedule, setEditingSchedule] = useState<SavedTimetable | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const timetableRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('kid_schedules_v2');
    if (saved) setSavedSchedules(JSON.parse(saved));

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.onend = () => { setIsListening(false); setRecordingTarget(null); setInterimTranscript(''); };
    }
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
        else interimText += event.results[i][0].transcript;
      }
      setInterimTranscript(interimText);
      if (finalText) {
        if (recordingTarget === 'main') setOralDescription(prev => prev + finalText);
      }
    };
  }, [recordingTarget]);

  const toggleListening = (target: RecordingTarget) => {
    if (isListening) { recognitionRef.current?.stop(); }
    else {
      if (!recognitionRef.current) return alert("浏览器不支持语音识别");
      setRecordingTarget(target);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const persistSchedules = (schedules: SavedTimetable[]) => {
    localStorage.setItem('kid_schedules_v2', JSON.stringify(schedules));
    setSavedSchedules(schedules);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setUploadedFile({
        data: base64Data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const constructedTitle = [studentName, academicYear, semester].filter(Boolean).join(' ') || '';

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const basePrompt = selectedTheme.prompt;
      const userContext = `学生姓名：${studentName}，年份：${academicYear}，学期：${semester}。励志名言：${selectedMotto}。`;
      const finalPrompt = basePrompt + (userContext ? ` 上下文：${userContext}` : '') + (oralDescription ? ` 根据口述内容：${oralDescription}` : '');
      
      const filePart = uploadedFile ? {
        inlineData: {
          data: uploadedFile.data,
          mimeType: uploadedFile.mimeType
        }
      } : undefined;

      const data = await generateTimetableData(finalPrompt, gradeGroup, filePart);
      
      if (constructedTitle) {
        data.title = constructedTitle;
      }
      if (selectedMotto) {
        data.motto = selectedMotto;
      }
      
      setGeneratedData(data);
      setCustomStyles(selectedTheme.defaultStyles);
    } catch (error) { 
      console.error(error);
      alert("生成失败，请重试。如果上传了文件，请确保它是清晰的 PDF 或图片。"); 
    }
    finally { setIsGenerating(false); }
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      { "星期": "周一", "时间": "08:00 - 08:45", "课程": "语文", "老师": "王老师", "教室": "101", "图标": "📚" },
      { "星期": "周一", "时间": "08:55 - 09:40", "课程": "数学", "老师": "李老师", "教室": "202", "图标": "📐" },
      { "星期": "周二", "时间": "10:00 - 10:45", "课程": "英语", "老师": "陈老师", "教室": "303", "图标": "🔤" },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "课表模板");
    XLSX.writeFile(wb, "KidSchedule_Template.xlsx");
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        const weekDays = ['周一', '周二', '周三', '周四', '周五'];
        const weekSchedule: DaySchedule[] = weekDays.map(day => ({ day, courses: [] }));

        data.forEach(row => {
          const dayName = row['星期'] || row['Day'] || '';
          const dayIdx = weekDays.findIndex(d => dayName && dayName.includes(d));
          if (dayIdx !== -1) {
            weekSchedule[dayIdx].courses.push({
              time: row['时间'] || row['Time'] || '',
              name: row['课程'] || row['Name'] || '自习',
              teacher: row['老师'] || row['Teacher'] || '',
              classroom: row['教室'] || row['Classroom'] || '',
              icon: row['图标'] || '📖'
            });
          }
        });

        const importedData: TimetableData = {
          title: constructedTitle || 'Excel 导入课表',
          weekSchedule,
          motto: selectedMotto || '格物致知，学以致用'
        };

        setGeneratedData(importedData);
        setCustomStyles(selectedTheme.defaultStyles);
        alert('Excel 课表已成功解析并导入！');
      } catch (err) {
        alert('导入失败，请检查 Excel 格式是否正确。');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateStyle = (field: keyof CustomStyles, value: any) => {
    setCustomStyles(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveToMySchedules = () => {
    if (!generatedData) return;
    setSaveName(constructedTitle || generatedData.title);
    setIsSaveModalOpen(true);
  };

  const confirmSave = () => {
    if (!generatedData) return;
    const newSaved: SavedTimetable = {
      id: Date.now().toString(),
      name: saveName || generatedData.title,
      notes: '',
      data: { ...generatedData, title: constructedTitle || generatedData.title, motto: selectedMotto, customStyles },
      themeId: selectedTheme.id,
      createdAt: Date.now(),
    };
    persistSchedules([newSaved, ...savedSchedules]);
    setIsSaveModalOpen(false);
  };

  const loadSchedule = (saved: SavedTimetable) => {
    setGeneratedData(saved.data);
    if (saved.data.motto) setSelectedMotto(saved.data.motto);
    if (saved.data.customStyles) setCustomStyles(saved.data.customStyles);
    const theme = THEMES.find(t => t.id === saved.themeId);
    if (theme) setSelectedTheme(theme);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSchedule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个课表吗？')) {
      persistSchedules(savedSchedules.filter(s => s.id !== id));
    }
  };

  const openEditModal = (saved: SavedTimetable, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSchedule(JSON.parse(JSON.stringify(saved)));
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = (dayIdx: number, courseIdx: number, field: keyof Course, value: string) => {
    if (!editingSchedule) return;
    const next = JSON.parse(JSON.stringify(editingSchedule));
    next.data.weekSchedule[dayIdx].courses[courseIdx][field] = value;
    setEditingSchedule(next);
  };

  const saveEditedSchedule = () => {
    if (!editingSchedule) return;
    const updated = savedSchedules.map(s => s.id === editingSchedule.id ? editingSchedule : s);
    persistSchedules(updated);
    setGeneratedData(editingSchedule.data);
    setIsEditModalOpen(false);
  };

  const exportAsImage = async (format: 'png' | 'jpeg') => {
    if (!timetableRef.current) return;
    setIsExporting(true); setShowExportMenu(false);
    const canvas = await html2canvas(timetableRef.current, { scale: 2, backgroundColor: null, useCORS: true });
    const link = document.createElement('a');
    link.download = `${constructedTitle || generatedData?.title || '课表'}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.95);
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-grow max-w-[1400px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Controls */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Step 0: Basic Info */}
          <section className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
              课表基本信息
            </h3>
            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">学生姓名</label>
                  <input 
                    type="text" 
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)} 
                    placeholder="如：张小明"
                    className="w-full p-4 bg-slate-50 border border-transparent focus:border-indigo-200 rounded-2xl outline-none font-bold transition-all"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">年份</label>
                    <input 
                      type="text" 
                      value={academicYear} 
                      onChange={(e) => setAcademicYear(e.target.value)} 
                      placeholder="如：2026"
                      className="w-full p-4 bg-slate-50 border border-transparent focus:border-indigo-200 rounded-2xl outline-none font-bold text-sm transition-all"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">学期</label>
                    <select 
                      value={semester} 
                      onChange={(e) => setSemester(e.target.value)} 
                      className="w-full p-4 bg-slate-50 border border-transparent focus:border-indigo-200 rounded-2xl outline-none font-bold text-sm transition-all appearance-none"
                    >
                      <option value="第一学期">第一学期</option>
                      <option value="第二学期">第二学期</option>
                    </select>
                 </div>
               </div>
            </div>

            {/* Motto Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">选择励志名言</label>
              <div className="flex flex-wrap gap-2">
                {MOTTO_OPTIONS.map((motto, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMotto(motto)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedMotto === motto ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'}`}
                  >
                    {motto.length > 10 ? motto.substring(0, 8) + '...' : motto}
                  </button>
                ))}
              </div>
              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-black text-slate-300 uppercase ml-1">自定义名言</label>
                <input 
                  type="text" 
                  value={selectedMotto} 
                  onChange={(e) => setSelectedMotto(e.target.value)}
                  placeholder="手动输入激励的话..."
                  className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-bold"
                />
              </div>
            </div>
          </section>

          {/* Step 1: Base & Content */}
          <section className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              智能识别与生成
            </h3>
            
            <div className="space-y-4">
              {/* PDF / Image Upload Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">上传课表文件 (PDF/图片)</label>
                <div 
                  onClick={() => pdfInputRef.current?.click()}
                  className={`w-full p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${uploadedFile ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}
                >
                  {uploadedFile ? (
                    <>
                      <span className="text-3xl">📄</span>
                      <span className="text-xs font-bold text-green-700 truncate max-w-full px-4">{uploadedFile.name}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        清除并更换
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl text-slate-300">📤</span>
                      <span className="text-[10px] font-black text-slate-400 text-center">点击上传纸质课表照片或 PDF<br/>AI 将自动为您整理内容</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={pdfInputRef} 
                  onChange={handleFileUpload} 
                  accept=".pdf, image/*" 
                  className="hidden" 
                />
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                {[GradeGroup.LOW, GradeGroup.HIGH].map(g => (
                  <button 
                    key={g}
                    onClick={() => setGradeGroup(g)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${gradeGroup === g ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {g === GradeGroup.LOW ? '趣味低龄 (1-3)' : '极简中高 (4-6)'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {THEMES.filter(t => t.gradeGroup === gradeGroup).map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setSelectedTheme(t); setCustomStyles(t.defaultStyles); }}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedTheme.id === t.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'}`}
                  >
                    <span className="text-2xl block mb-2">{t.icon}</span>
                    <span className="text-xs font-black block">{t.name}</span>
                  </button>
                ))}
              </div>

              <div className="relative group">
                <textarea 
                  value={oralDescription + (isListening && recordingTarget === 'main' ? interimTranscript : '')}
                  onChange={(e) => setOralDescription(e.target.value)}
                  placeholder="补充说明或直接通过语音输入..."
                  className="w-full h-24 p-4 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                />
                <button 
                  onClick={() => toggleListening('main')}
                  className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg transition-all ${isListening && recordingTarget === 'main' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:scale-110'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-5 bg-black text-white rounded-2xl font-black shadow-2xl hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isGenerating ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : '⚡ 开始 AI 智能排课'}
              </button>
            </div>
          </section>

          {/* Step 2: Customization (Only show if data generated) */}
          {(generatedData || isGenerating) && (
            <section className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 space-y-6 animate-in slide-in-from-left duration-500">
              <h3 className="text-xl font-black flex items-center gap-3 text-indigo-600">
                <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                🎨 深度视觉定制
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">主背景色</label>
                    <input type="color" value={customStyles.primaryColor} onChange={(e) => updateStyle('primaryColor', e.target.value)} className="w-full h-12 rounded-xl border-none p-1 cursor-pointer bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">强调/边框色</label>
                    <input type="color" value={customStyles.accentColor} onChange={(e) => updateStyle('accentColor', e.target.value)} className="w-full h-12 rounded-xl border-none p-1 cursor-pointer bg-slate-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">字体风格</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['sans', 'rounded', 'serif', 'mono'].map(f => (
                      <button 
                        key={f} 
                        onClick={() => updateStyle('fontFamily', f as FontFamily)}
                        className={`py-2 text-[10px] font-bold border rounded-lg transition-all ${customStyles.fontFamily === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 hover:border-slate-300'}`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">边框工艺</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['solid', 'dashed', 'dotted', 'double'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => updateStyle('borderStyle', s as BorderStyle)}
                        className={`py-2 text-[10px] font-bold border rounded-lg transition-all ${customStyles.borderStyle === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 hover:border-slate-300'}`}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motif Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center">
                    <span>守护勋章 (Motif)</span>
                    <span className="text-indigo-600 font-bold">{customStyles.motif}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_MOTIFS.map(m => (
                      <button 
                        key={m.id} 
                        title={m.label}
                        onClick={() => updateStyle('motif', m.emoji)}
                        className={`p-3 text-2xl rounded-xl transition-all ${customStyles.motif === m.emoji ? 'bg-indigo-100 border-2 border-indigo-500 scale-110 shadow-lg' : 'bg-slate-50 border border-transparent hover:bg-slate-100'}`}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Side: Preview & History */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3">
              <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
              设计预览
            </h3>
            <div className="flex gap-3 relative">
              {generatedData && (
                <>
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-sm font-black shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    🚀 导出 & 下载
                  </button>
                  {showExportMenu && (
                    <div ref={exportMenuRef} className="absolute top-14 right-44 z-50 bg-white shadow-2xl rounded-2xl p-2 border border-slate-100 flex flex-col min-w-[140px]">
                      <button onClick={() => exportAsImage('png')} className="p-3 text-left hover:bg-slate-50 rounded-xl text-xs font-bold">🖼️ PNG 图片</button>
                      <button onClick={() => exportAsImage('jpeg')} className="p-3 text-left hover:bg-slate-50 rounded-xl text-xs font-bold">📸 JPG 图片</button>
                    </div>
                  )}
                  <button 
                    onClick={handleSaveToMySchedules}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    💾 保存作品
                  </button>
                </>
              )}
            </div>
          </div>

          {!generatedData && !isGenerating && (
            <div className="aspect-[4/3] bg-white border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-6xl animate-pulse">✨</div>
              <h4 className="text-2xl font-black">准备就绪</h4>
              <p className="text-slate-400 max-w-sm leading-relaxed">您可以上传已有课表照片/PDF，AI 会自动为您整理并转换成精美的电子版。</p>
            </div>
          )}

          {isGenerating && (
            <div className="aspect-[4/3] bg-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-20 text-center space-y-8 overflow-hidden relative">
              <div className="w-24 h-24 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="space-y-2 relative z-10">
                <h4 className="text-2xl font-black animate-pulse">正在精细建模课程...</h4>
                <p className="text-slate-400 text-sm">{uploadedFile ? '正在从文档中提取课表内容' : 'Gemini AI 正在为您自动分类、整理并匹配视觉元素'}</p>
              </div>
            </div>
          )}

          {generatedData && !isGenerating && (
            <TimetableCard 
              ref={timetableRef} 
              data={generatedData} 
              customStyles={customStyles} 
              userTitle={constructedTitle ? `${constructedTitle} 课表` : ''} 
              selectedMotto={selectedMotto}
            />
          )}

          {/* History Gallery */}
          {savedSchedules.length > 0 && (
            <section className="pt-12 border-t border-slate-200">
              <h3 className="text-xl font-black flex items-center gap-3 mb-8">
                <span className="w-2 h-8 bg-slate-300 rounded-full"></span>
                作品集 (History)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedSchedules.map((saved) => (
                  <div 
                    key={saved.id}
                    onClick={() => loadSchedule(saved)}
                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-blue-400 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-slate-50">
                          {THEMES.find(t => t.id === saved.themeId)?.icon || '📅'}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[180px]">{saved.name}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(saved.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => openEditModal(saved, e)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={(e) => deleteSchedule(saved.id, e)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
            <div className="p-10 space-y-6">
              <h3 className="text-2xl font-black">保存到作品集</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">给课表起个名字</label>
                  <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold" placeholder="2024秋季学期课表" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsSaveModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">取消</button>
                <button onClick={confirmSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">确认保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl my-8 relative flex flex-col scale-in-center">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white rounded-t-[3rem] sticky top-0 z-20">
              <div>
                <h3 className="text-2xl font-black text-slate-900">✏️ 编辑课程细节</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{editingSchedule.name}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-10 max-h-[70vh] overflow-y-auto space-y-16">
              {editingSchedule.data.weekSchedule.map((day, dIdx) => (
                <div key={dIdx} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white font-black">{day.day[day.day.length - 1]}</span>
                    <h4 className="font-black text-xl text-slate-900">{day.day}</h4>
                    <div className="flex-grow h-px bg-slate-100"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {day.courses.map((course, cIdx) => {
                      return (
                        <div key={cIdx} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-5 transition-all hover:bg-white hover:shadow-xl hover:border-blue-100 group/course">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full tracking-widest">Session {cIdx + 1}</span>
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-black text-slate-300">ICON</label>
                              <input type="text" value={course.icon || ''} onChange={(e) => handleUpdateCourse(dIdx, cIdx, 'icon', e.target.value)} className="w-10 h-10 text-center text-lg border-none rounded-xl bg-white shadow-sm outline-none" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">课程名称</label>
                              <input type="text" value={course.name} onChange={(e) => handleUpdateCourse(dIdx, cIdx, 'name', e.target.value)} className="w-full font-black p-3 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">时间</label>
                                <input type="text" value={course.time} onChange={(e) => handleUpdateCourse(dIdx, cIdx, 'time', e.target.value)} className="w-full text-xs font-bold p-3 bg-white border border-slate-100 rounded-xl outline-none" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">老师</label>
                                <input type="text" value={course.teacher || ''} onChange={(e) => handleUpdateCourse(dIdx, cIdx, 'teacher', e.target.value)} className="w-full text-xs font-bold p-3 bg-white border border-slate-100 rounded-xl outline-none" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-6 rounded-b-[3rem]">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-colors">放弃修改</button>
              <button onClick={saveEditedSchedule} className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">保存全部更改</button>
            </div>
          </div>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl animate-bounce mb-6"></div>
          <p className="text-xl font-black">正在生成高清图...</p>
        </div>
      )}
    </div>
  );
}
