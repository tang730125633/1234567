
import { GradeGroup, TimetableTheme, CustomStyles } from './types';

const defaultBase: CustomStyles = {
  primaryColor: '#ffffff',
  accentColor: '#3b82f6',
  textColor: '#1e293b',
  fontFamily: 'sans',
  borderStyle: 'solid',
  borderRadius: 'xl',
  motif: '✨'
};

export const MOTTO_OPTIONS = [
  "书山有路勤为径，学海无涯苦作舟。",
  "少年易学老难成，一寸光阴不可轻。",
  "黑发不知勤学早，白首方悔读书迟。",
  "天才就是百分之九十九的汗水加百分之一的灵感。",
  "读万卷书，行万里路。",
  "每天进步一点点。",
  "宝剑锋从磨砺出，梅花香自苦寒来。",
  "世上无难事，只要肯登攀。"
];

export const THEMES: TimetableTheme[] = [
  {
    id: 'animal',
    name: '动物主题',
    description: '暖黄色调，小熊边框。',
    gradeGroup: GradeGroup.LOW,
    color: 'bg-amber-100 border-amber-300 text-amber-900',
    icon: '🐻',
    defaultStyles: {
      ...defaultBase,
      primaryColor: '#fef3c7',
      accentColor: '#d97706',
      textColor: '#78350f',
      fontFamily: 'rounded',
      motif: '🐻'
    },
    prompt: '帮我生成小学1年级卡通动物主题电子课表，周一到周五每天6节课，包含课程名、老师、教室栏，每节课加对应学科小图标（语文=书本、数学=尺子），边框用小熊图案，配色暖黄色。不包含任何提醒或备注栏。'
  },
  {
    id: 'space',
    name: '宇宙科幻',
    description: '深蓝色调，火箭星球。',
    gradeGroup: GradeGroup.LOW,
    color: 'bg-blue-900 border-blue-700 text-blue-50',
    icon: '🚀',
    defaultStyles: {
      ...defaultBase,
      primaryColor: '#1e3a8a',
      accentColor: '#3b82f6',
      textColor: '#eff6ff',
      fontFamily: 'mono',
      motif: '🚀'
    },
    prompt: '生成小学2年级宇宙科幻风电子课表，布局网格状，加入火箭、星球元素，学科用不同颜色区分。不包含任何提醒功能。'
  },
  {
    id: 'hand-drawn',
    name: '童趣手绘',
    description: '清新绿色，彩虹云朵。',
    gradeGroup: GradeGroup.LOW,
    color: 'bg-green-100 border-green-300 text-green-900',
    icon: '🌈',
    defaultStyles: {
      ...defaultBase,
      primaryColor: '#f0fdf4',
      accentColor: '#22c55e',
      textColor: '#14532d',
      fontFamily: 'rounded',
      motif: '🌈'
    },
    prompt: '生成小学3年级手绘风电子课表，用云朵、彩虹、小太阳装饰边框，护眼绿色系，包含节次、时间、课程。不包含提醒列。'
  },
  {
    id: 'minimalist',
    name: '极简时间轴',
    description: '浅蓝白色，适合高年级。',
    gradeGroup: GradeGroup.HIGH,
    color: 'bg-slate-50 border-slate-200 text-slate-800',
    icon: '⏱️',
    defaultStyles: {
      ...defaultBase,
      primaryColor: '#f8fafc',
      accentColor: '#64748b',
      textColor: '#0f172a',
      fontFamily: 'sans',
      motif: '⏱️',
      borderRadius: 'md'
    },
    prompt: '帮我生成小学5年级极简时间轴电子课表，横向排版，左侧标注节次和对应时间，右侧填课程、教室、老师，配色浅蓝+白色。不包含作业提醒或兴趣班倒计时板块。'
  }
];
