
export enum GradeGroup {
  LOW = 'LOW', // 1-3年级
  HIGH = 'HIGH', // 4-6年级
}

export type FontFamily = 'sans' | 'rounded' | 'serif' | 'mono';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double';
export type BorderRadius = 'none' | 'md' | 'xl' | '3xl';

export interface CustomStyles {
  primaryColor: string;    // 背景主色
  accentColor: string;     // 边框和强调色
  textColor: string;       // 文字颜色
  fontFamily: FontFamily;
  borderStyle: BorderStyle;
  borderRadius: BorderRadius;
  motif: string;           // 装饰图标/Emoji
}

export interface TimetableTheme {
  id: string;
  name: string;
  description: string;
  gradeGroup: GradeGroup;
  prompt: string;
  color: string;           // 默认 Tailwind 类名（备用）
  icon: string;
  defaultStyles: CustomStyles;
}

export interface Course {
  time: string;
  name: string;
  teacher?: string;
  classroom?: string;
  icon?: string;
}

export interface DaySchedule {
  day: string;
  courses: Course[];
}

export interface TimetableData {
  title: string;
  weekSchedule: DaySchedule[];
  motto?: string;
  customStyles?: CustomStyles;
}

export interface SavedTimetable {
  id: string;
  name: string;
  notes: string;
  data: TimetableData;
  themeId: string;
  createdAt: number;
}
