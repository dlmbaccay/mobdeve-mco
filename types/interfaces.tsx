
export interface LocationType {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export interface ReportType {
  markerId: string;
  reportId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: any;
  userId: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

export interface MarkerType {
  markerId: string;
  latitude: number;
  longitude: number;
  lastCreatedReportAt: any;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}