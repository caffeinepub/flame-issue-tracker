import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CallerInfo {
    principal: Principal;
    role: UserRole;
}
export type Principal = Principal;
export interface Complaint {
    id: bigint;
    status: ComplaintStatus;
    creator: Principal;
    urgencyLevel: string;
    hidden: boolean;
    description: string;
    timestamp: bigint;
    category: ComplaintCategory;
    proof?: ExternalBlob;
}
export interface SolutionUpdate {
    id: bigint;
    relatedComplaints: Array<bigint>;
    title: string;
    relatedCategories: Array<ComplaintCategory>;
    description: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum ComplaintCategory {
    disciplineRules = "disciplineRules",
    professorsAcademics = "professorsAcademics",
    administration = "administration",
    raggingSafety = "raggingSafety",
    hostelFacilities = "hostelFacilities",
    foodServices = "foodServices"
}
export enum ComplaintStatus {
    resolved = "resolved",
    submitted = "submitted",
    underReview = "underReview",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBannedWord(word: string): Promise<void>;
    addSolution(title: string, description: string, relatedComplaints: Array<bigint>, relatedCategories: Array<ComplaintCategory>): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    debugGetCallerPrincipal(): Promise<Principal>;
    deleteComplaint(complaintId: bigint): Promise<void>;
    filterComplaintsByCategory(category: ComplaintCategory): Promise<Array<Complaint>>;
    filterComplaintsByStatus(status: ComplaintStatus): Promise<Array<Complaint>>;
    getAdminAllowlist(): Promise<{
        callerRole: UserRole;
        adminPrincipals: Array<Principal>;
        initialAdminPresent: boolean;
    }>;
    getAdminAllowlistDebugInfo(): Promise<{
        callerRole: UserRole;
        isInitialAdminStillAdmin: boolean;
        isCallerAdmin: boolean;
        initialAdminPrincipal: Principal;
        callerPrincipal: Principal;
    }>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaint(complaintId: bigint): Promise<Complaint | null>;
    getCurrentUserPrincipal(): Promise<CallerInfo>;
    getPublicComplaints(): Promise<Array<Complaint>>;
    getSolutions(): Promise<Array<SolutionUpdate>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hideComplaint(complaintId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchComplaints(searchText: string): Promise<Array<Complaint>>;
    submitComplaint(category: ComplaintCategory, description: string, urgencyLevel: string, proof: ExternalBlob | null): Promise<bigint>;
    updateComplaintStatus(complaintId: bigint, newStatus: ComplaintStatus): Promise<void>;
}
