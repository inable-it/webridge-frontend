export interface User {
    id: number;
    email: string;
    name: string;
    profile_image: string | null;
    provider: string;
    created_at: string;
}

export interface LoginResponse {
    user: User;
    access: string;
    refresh: string;
}