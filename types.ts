export enum AppMode {
  TWO_D = '2D',
  THREE_D_PUZZLE = '3D_PUZZLE',
}

export interface GeneratorSettings {
  cutColor: string;
  engraveColor: string;
  cutStrokeWidth: number; // in mm
  materialThickness: number; // in mm, crucial for 3D puzzles
}

export interface GeneratedResult {
  svgContent: string;
  description: string;
  width: string;
  height: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}