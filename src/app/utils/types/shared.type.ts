export enum MessageType {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED'
}

export interface UserType {
  Id?: string;
  Username: string;
  UserHash: string;
  VoiceItEnrollmentId: string;
  PathToVoiceNote: string;
}

export interface AuthRecordType {
  Id?: string;
  Label: string;
  Username: string;
  Password: string;
  DateCreated?: Date;
  UserId: string;
}

export interface UserRecordType {
  Id?: string;
  VoiceItUserId: string;
  PathToVoiceRecording: string[];
  RecordedPhrase: string;
  // EnrollmentId: number;
  DateCreated: Date;
  HashKey: string;
  Username: string;
}

export interface CustomAPIType {
  Message: string;
  Type: MessageType;
}


// VoiceIt Types
export interface VoiceItPhraseType {
  message: string;
  phrases?: PhraseType[];
  count: number;
  responseCode: string;
  timeTaken: string;
  status: number;
}

export interface PhraseType {
  id: number;
  createdAt?: null;
  text: string;
  contentLanguage: string;
}

export interface CreateVoiceItUserType {
  createdAt: number;
  timeTaken: string;
  message: string;
  userId: string;
  responseCode: string;
  status: number;
}

export interface EnrollVoiceItUserType {
  userId: string;
  contentLanguage: string;
  phrase: string;
  fileUrl: string;
}

export interface EnrollVoiceItUserResponseType {
  textConfidence: number;
  createdAt: number;
  timeTaken: string;
  contentLanguage: string;
  text: string;
  id: number;
  message: string;
  apiCallId: string;
  responseCode: string;
  status: number;
}

export interface AuthenticateVoiceItUserType {
  userId: string;
  phrase: string;
  fileUrl: string;
  contentLanguage: string;
}

export interface AuthenticatelVoiceItUserResponseType {
  message: string;
  status: number;
  confidence: number;
  text: string;
  textConfidence: number;
  timeTaken: string;
  responseCode: string;
}


export enum LocalStorageKeyType {
  VOICEIT_USER_ID = 'VOICEIT_USER_ID',
  VOICE_AUTHENTICATED_USER_DATA = 'VOICE_AUTHENTICATED_USER_DATA',
}
